const https = require('https');

const weatherIcons = {
  'sunny': '☀️',
  'clear': '☀️',
  'cloudy': '☁️',
  'overcast': '🌥️',
  'fog': '🌫️',
  'drizzle': '🌦️',
  'rain': '🌧️',
  'snow': '❄️',
  'thunderstorm': '⛈️',
  'hail': '🧊'
};

const amapConditionMap = {
  '晴': { condition: '晴朗', icon: 'sunny' },
  '多云': { condition: '多云', icon: 'cloudy' },
  '阴天': { condition: '阴天', icon: 'overcast' },
  '小雨': { condition: '小雨', icon: 'rain' },
  '中雨': { condition: '中雨', icon: 'rain' },
  '大雨': { condition: '大雨', icon: 'rain' },
  '暴雨': { condition: '暴雨', icon: 'rain' },
  '小雪': { condition: '小雪', icon: 'snow' },
  '中雪': { condition: '中雪', icon: 'snow' },
  '大雪': { condition: '大雪', icon: 'snow' },
  '暴雪': { condition: '暴雪', icon: 'snow' },
  '雾': { condition: '雾', icon: 'fog' },
  '霾': { condition: '霾', icon: 'fog' },
  '雷阵雨': { condition: '雷阵雨', icon: 'thunderstorm' },
  '雷阵雨伴有冰雹': { condition: '雷阵雨伴冰雹', icon: 'thunderstorm' },
  '雨夹雪': { condition: '雨夹雪', icon: 'snow' },
  '毛毛雨': { condition: '毛毛雨', icon: 'drizzle' },
  '冻雨': { condition: '冻雨', icon: 'rain' },
  '沙尘': { condition: '沙尘', icon: 'fog' },
  '浮尘': { condition: '浮尘', icon: 'fog' },
  '扬沙': { condition: '扬沙', icon: 'fog' },
  '沙尘暴': { condition: '沙尘暴', icon: 'fog' }
};



const fetchAmapGeocode = async (cityName) => {
  const amapKey = process.env.AMAP_KEY;
  if (!amapKey || amapKey === 'your_amap_key_here') {
    throw new Error('未配置高德地图API密钥');
  }

  const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(cityName)}&key=${amapKey}`;

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === '1' && result.geocodes && result.geocodes.length > 0) {
            const geocode = result.geocodes[0];
            const cityCode = geocode.adcode.substring(0, 4) + '00';
            resolve({ cityCode, formattedAddress: geocode.formatted_address });
          } else {
            reject(new Error('地理编码失败: ' + (result.info || '未知错误')));
          }
        } catch (e) {
          reject(e);
        }
      });
      response.on('error', reject);
    }).on('error', reject);
  });
};

// 逆地理编码：根据经纬度获取地址
const fetchAmapReverseGeocode = async (latitude, longitude) => {
  const amapKey = process.env.AMAP_KEY;
  if (!amapKey || amapKey === 'your_amap_key_here') {
    throw new Error('未配置高德地图API密钥');
  }

  const url = `https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&key=${amapKey}`;

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === '1' && result.regeocode) {
            const addressComponent = result.regeocode.addressComponent;
            const formattedAddress = result.regeocode.formatted_address;
            resolve({
              cityCode: addressComponent.adcode.substring(0, 4) + '00',
              formattedAddress: formattedAddress,
              province: addressComponent.province,
              city: addressComponent.city,
              district: addressComponent.district
            });
          } else {
            reject(new Error('逆地理编码失败: ' + (result.info || '未知错误')));
          }
        } catch (e) {
          reject(e);
        }
      });
      response.on('error', reject);
    }).on('error', reject);
  });
};

const fetchAmapWeather = async (cityCode) => {
  const amapKey = process.env.AMAP_KEY;
  if (!amapKey || amapKey === 'your_amap_key_here') {
    throw new Error('未配置高德地图API密钥');
  }

  const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${cityCode}&key=${amapKey}&extensions=base`;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('请求超时'));
    }, 10000);

    https.get(url, (response) => {
      clearTimeout(timeout);
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === '1' && result.lives && result.lives.length > 0) {
            resolve(result.lives[0]);
          } else {
            reject(new Error('获取天气失败: ' + (result.info || '未知错误')));
          }
        } catch (e) {
          reject(e);
        }
      });
      response.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
};



// 解析地址，只提取区县名称
const parseAddress = (province, city, district, formattedAddress) => {
  // 优先使用 district（区县）
  if (district) {
    return district;
  }
  
  // 备用方案：从格式化地址中解析
  if (formattedAddress) {
    // 尝试匹配区县
    const districtMatch = formattedAddress.match(/([^省市区县]+[市区县])/);
    if (districtMatch) {
      // 去除省市，只保留最后一个区县
      const parts = districtMatch[1].split(/[省市]/);
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        if (lastPart) return lastPart;
      }
      return districtMatch[1];
    }
  }
  
  return formattedAddress || '未知城市';
};

// 默认兜底数据
const getDefaultWeatherData = () => {
  return {
    city: '未知城市',
    temperature: 24,
    condition: '未知',
    humidity: 50,
    windDirection: '未知',
    windPower: '未知',
    windSpeed: 0,
    icon: '🌡️',
    updateTime: new Date().toLocaleString('zh-CN'),
    source: '默认数据'
  };
};

const getWeather = async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    const amapKey = process.env.AMAP_KEY;
    const hasValidKey = amapKey && amapKey !== 'your_amap_key_here';

    if (!hasValidKey) {
      console.warn('未配置高德地图API密钥');
      return res.json(getDefaultWeatherData());
    }

    let cityCode;
    let cityName;

    try {
      // 优先使用经纬度进行逆地理编码
      if (lat && lon && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))) {
        console.log('使用经纬度定位:', lat, lon);
        const geocode = await fetchAmapReverseGeocode(parseFloat(lat), parseFloat(lon));
        cityCode = geocode.cityCode;
        cityName = parseAddress(geocode.province, geocode.city, geocode.district, geocode.formattedAddress);
      }
      // 其次使用城市名进行地理编码
      else if (city) {
        console.log('使用城市名定位:', city);
        const geocode = await fetchAmapGeocode(city);
        cityCode = geocode.cityCode;
        cityName = parseAddress(null, null, null, geocode.formattedAddress);
      }
      // 最后使用默认值
      else {
        console.log('使用默认位置: 北京');
        cityCode = '110000';
        cityName = '北京市';
      }

      console.log('最终城市代码:', cityCode, '城市名称:', cityName);

      // 获取天气数据
      const weatherData = await fetchAmapWeather(cityCode);

      // 解析天气状况
      const conditionMap = amapConditionMap[weatherData.weather] || { condition: weatherData.weather, icon: 'cloudy' };
      const icon = weatherIcons[conditionMap.icon] || '🌡️';

      // 解析风向（去除"风"字）
      const windDirection = weatherData.winddirection ? weatherData.winddirection.replace('风', '') : '未知';

      // 解析风力等级
      const windPower = weatherData.windpower || '未知';

      // 计算风速（km/h） - 风力等级 × 5（近似值）
      const windSpeed = windPower !== '未知' ? parseInt(windPower.replace('级', '')) * 5 : 0;

      // 构建返回数据
      const result = {
        city: cityName,
        temperature: parseInt(weatherData.temperature),
        condition: conditionMap.condition,
        humidity: parseInt(weatherData.humidity),
        windDirection: windDirection,
        windPower: windPower,
        windSpeed: windSpeed,
        icon: icon,
        updateTime: weatherData.reporttime,
        source: '高德实时数据'
      };

      res.json(result);
    } catch (error) {
      console.error('获取天气失败:', error.message);
      res.json(getDefaultWeatherData());
    }
  } catch (error) {
    console.error('Weather API error:', error);
    res.json(getDefaultWeatherData());
  }
};

// 获取天气预报（预留接口）
const fetchAmapWeatherForecast = async (cityCode) => {
  const amapKey = process.env.AMAP_KEY;
  if (!amapKey || amapKey === 'your_amap_key_here') {
    throw new Error('未配置高德地图API密钥');
  }

  const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${cityCode}&key=${amapKey}&extensions=all`;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('请求超时'));
    }, 10000);

    https.get(url, (response) => {
      clearTimeout(timeout);
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === '1' && result.forecasts && result.forecasts.length > 0) {
            resolve(result.forecasts);
          } else {
            reject(new Error('获取天气预报失败: ' + (result.info || '未知错误')));
          }
        } catch (e) {
          reject(e);
        }
      });
      response.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
};

const getWeatherForecast = async (req, res) => {
  try {
    const { city } = req.query;

    const amapKey = process.env.AMAP_KEY;
    const hasValidKey = amapKey && amapKey !== 'your_amap_key_here';

    if (!hasValidKey) {
      console.warn('未配置高德地图API密钥');
      return res.json([]);
    }

    let cityCode;

    try {
      // 获取城市代码
      if (city) {
        const geocode = await fetchAmapGeocode(city);
        cityCode = geocode.cityCode;
      } else {
        // 默认使用北京
        cityCode = '110000';
      }

      // 获取天气预报数据
      const forecasts = await fetchAmapWeatherForecast(cityCode);

      // 解析预报数据
      const result = forecasts.map(forecast => {
        const casts = forecast.casts || [];
        return casts.map(cast => ({
          date: cast.date,
          dayWeather: cast.dayweather,
          nightWeather: cast.nightweather,
          dayTemp: cast.daytemp,
          nightTemp: cast.nighttemp,
          dayWind: cast.daywind,
          nightWind: cast.nightwind,
          week: cast.week
        }));
      }).flat();

      res.json(result);
    } catch (error) {
      console.error('获取天气预报失败:', error.message);
      res.json([]);
    }
  } catch (error) {
    console.error('Weather Forecast API error:', error);
    res.json([]);
  }
};

module.exports = { getWeather, getWeatherForecast };
