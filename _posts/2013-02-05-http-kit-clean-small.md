---
author: feng
date: '2013-02-06 22-21-00'
layout: posts
status: publish
title: http-kit is clean and small, less is exponentially more
---

* [HTTP server](http://http-kit.org/server.html): event-driven, ring adapter, websocket extension, asynchronous extension
* [HTTP Client](http://http-kit.org/client.html): event-driven, asynchronous with promise, synchronous with @promise, keep-alive
* [Timer facility](http://http-kit.org/timer.html)


All the above + high concurrency + high performance + nice API + written from scrach = ~3K lines of code.

Clojure is awesome

Clojure + JAVA = Performance + Nice API

Less is exponentially more

  <pre>
    http://cloc.sourceforge.net v 1.56  T=0.5 s (94.0 files/s, 8216.0 lines/s)
    -------------------------------------------------------------------------------
    Language                     files          blank        comment           code
    -------------------------------------------------------------------------------
    Java                            44            534            396           2844
    Clojure                          3             52             15            267
    -------------------------------------------------------------------------------
    SUM:                            47            586            411           3111
    -------------------------------------------------------------------------------
  </pre>


*cloc runned time: Tue Feb  5 23:23:58 CST 2013, on master branch, from src directory*

*Edit: 2013/3/29 with release 2.0.0, the codebase is slightly larger: 2970 lines of Java, 266 lines of Clojure*
