# Cache design
A cache stores frequently accessed data to reduce latency and database load. Time to live (TTL) expires entries after a configured duration. Cache invalidation prevents stale values from being served. A cache miss requires fetching data from the original source. Measure hit rate and tail latency before deciding whether caching helps.
