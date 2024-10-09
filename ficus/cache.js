"use strict";

const cache = new Map();
class Cache {
  constructor(name, fetcher, options = {}) {
    this.name = name;
    this.cache = new Map();
    this.fetcher = fetcher;
    this.ttl_sec = options.ttl_sec * 1000 || 60000; // Default to 1 minute if not specified
  }
  get = async key => {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      const now = Date.now();
      if (now - cached.insert_time < this.ttl) {
        return cached.data;
      }
    }
    const fetched_data = await this.fetcher.fetch_id(key);
    this.cache.set(key, {
      data: fetched_data,
      insert_time: Date.now()
    });
    return fetched_data;
  };
}
class TimeseriesCache {
  constructor(name, fetcher, options = {}) {
    this.name = name;
    this.cache = [];
    this.ttl_sec = options.ttl_sec * 1000 || 60000; // Default to 1 minute if not specified
    this.id_cache = new Cache(`${name}_ids`, fetcher, options);
  }
  find_first = t => {
    for (let i = 0; i < this.cache.length; ++i) {
      const c = this.cache[i];
      if (c.start <= t && t < c.end) {
        // t is in this range
        return i;
      }
      if (c.start > t) {}
    }
    return -1;
  };
  //   let left = 0;
  //   let right = this.cache.length;
  //   while (left < right) {
  //     const mid = Math.floor((left + right) / 2);
  //     const mid_item = this.cache[mid];
  //     if (t >= mid_item.end) {
  //       // needle is after this range -> right half
  //       left = mid + 1;
  //       continue;
  //     } else if (t < mid_item.start) {
  //       // needle is before this range -> left half
  //       right = mid - 1;
  //     } else {
  //       // then start <= t < end, t is in this range
  //       return mid;
  //     }
  //   }
  //   return -1;
  // };

  get_id = async id => {
    return await this.id_cache.get(id);
  };
  get = async (in_start, in_end) => {
    // some cases to consider
    // 1 / input range is contained within a single cache range.
    //   no fetch necessary
    // 2 / input start is in a cache range, end is outside.
    //   fetch [cache_range_end, in_end)
    // 3 / input end is in a cache range, start is outside.
    //   fetch [in_start, cache_range_start)
    // 4 / input start and end are outside a cache range.
    //   there might be PARTIAL cache coverage in the middle of the range
    //   but, ignore any partial coverage because network overhead is too great
    //   fetch [in_start, in_end)
    // 5 / input start and end are both in cache ranges, but different ranges
    //   fetch [start_cache_range_end, end_cache_range_start)
    //
    // To meet these requirements, we only need to find which range contains
    // the start, and which range contains the end
    //
    // In all cases, the cache will handle deduping items and combining ranges
    const s_idx = this.find_idx(in_start);
    const e_idx = this.find_idx(in_end);
    let fetch_start = in_start;
    let fetch_end = in_end;
    if (s_idx == -1) {
      // start is not found in any range
    }
    if (e_idx == -1) {
      // end is not found in any range
    }
    if (s_idx != e_idx) {
      // whaa
    }
    const index = this.cache.findIndex(({
      start,
      end
    }) => req_start >= start);
    return index;
  };
}

// Load cache from localStorage on initialization
function load_cache_from_storage() {
  const stored_cache = localStorage.getItem("dataCache");
  if (stored_cache) {
    const parsed_cache = JSON.parse(stored_cache);
    Object.keys(parsed_cache).forEach(key => {
      cache.set(key, parsed_cache[key]);
    });
  }
}

// Save cache to localStorage
function save_cache_to_storage() {
  const cache_object = Object.fromEntries(cache);
  localStorage.setItem("dataCache", JSON.stringify(cache_object));
}
function get_cached_data(start_time, end_time) {
  const key = `${start_time}-${end_time}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = fetch_data_from_server(start_time, end_time);
  cache.set(key, data);
  save_cache_to_storage();
  return data;
}

// Initialize cache from storage
load_cache_from_storage();
function fetch_data_from_server(start_time, end_time) {
  // Simulated server request
  return {
    start_time,
    end_time,
    data: "Sample data"
  };
}