import redis from '../../configs/redis.config.js';

export const setCache = async (key, value, ttlInSeconds) => {
  try {
    const stringValue = JSON.stringify(value);
    
    if (ttlInSeconds) {
      await redis.set(key, stringValue, 'EX', ttlInSeconds);
    } else {
      await redis.set(key, stringValue);
    }
  } catch (error) {
    console.error(`Error setting cache for key "${key}":`, error);
    // Handle error as needed
    throw new Error(error.message)
  }
};

export const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? await JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting cache for key "${key}":`, error);
    // Handle error as needed
    return null;
  }
};


export const deleteCache = async (key) => {
  try {
    // DEL returns the number of keys that were removed (0 or 1 for a single key)
    const deletedCount = await redis.del(key);
    return deletedCount === 1;
  } catch (error) {
    console.error(`Error deleting cache for key "${key}":`, error);
    return false;
  }
}