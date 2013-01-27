---
author: feng
date: '2013-1-19 22-21-00'
layout: posts
status: publish
title: 600k concurrent HTTP connections on PC, with Clojure & http-kit
categories: ['http-kit', 'clojure']
---

Inspired by [Scaling node.js to 100k concurrent connections!](http://blog.caustik.com/2012/04/08/scaling-node-js-to-100k-concurrent-connections/) and [Node.js w/250k concurrent connections!](http://blog.caustik.com/2012/04/10/node-js-w250k-concurrent-connections/). I did some test for http-kit!

http-kit manages to make **600k** concurrent connections, on PC!

### Server's logic

The server read the length param from the request, generate a string of that length.

{% highlight clojure %}
;; main.clj
;; ~20k string
(def const-str (apply str (repeat 200 "http-kit is a http server & client written from scrach for high performance clojure web applications, support async and websocket")))

(defn handler [req]
  (let [length (to-int (or (-> req :params :length) 1024))]
    {:status 200
     :headers {"Content-Type" "text/plain"}
     :body (subs const-str 0 (max (min 10240 length) 1))}))

(defn -main [& args]
  (run-server (-> handler wrap-keyword-params wrap-params)
              {:port 8000})
  (println (str "Server started. listen at 0.0.0.0@8000")))

{% endhighlight %}

Start the server:

{% highlight sh %}
java -server -Xms3072m -Xmx3072m -cp `lein classpath` clojure.main -m main
{% endhighlight %}


### Linux config

The server need to set max allowed open file to a much larger value. The default value is ~1024

{% highlight sh %}
echo 9999999 | sudo tee /proc/sys/fs/nr_open
echo 9999999 | sudo tee /proc/sys/fs/file-max

# edit /etc/security/limits.conf, add the following line, need logout and login again
* - nofile 4999999

# set before run the server and test code
ulimit -n 4999999
{% endhighlight %}

More ports for test code to use

{% highlight sh %}
sudo sysctl -w net.ipv4.ip_local_port_range="1025 65535"
{% endhighlight %}

### Hardware & Software

The server and test code are both run on my desktop:

* **CPU**: Intel(R) Core(TM) i7-2600 CPU @ 3.40GHz, 4 core, 8 threads
* **RAM**: 16G @ 1333MHZ
* **OS** : Linux 3.2.0-2-amd64 #1 SMP Sun Apr 15 16:47:38 UTC 2012 x86_64 GNU/Linux
* **http-kit**: "2.0-rc1"
* **JVM**: 1.7.0_04

### How to make 600k concurrent connections on a single PC

A IP can only issue most 65536 connections to a server, since socket port is unsigned short. But we can bypass this limit.
On Linux, it's quite easy to set up virtual network interface:

{% highlight sh %}

for i in `seq 200 230`; do sudo ifconfig eth0:$i 192.168.1.$i up ; done

{% endhighlight %}

Then your computer have many IPs, from `192.168.1.200` to `192.168.1.230`. The server bind to `0.0.0.0@port`, the client can connect
`192.168.1.200@port`, or `192.168.1.201@port`, etc. Per IP can have about 60K concurrent connections. Then the client can issue as many concurrent connections as it needed.

### Concurrency test code

The client opens 600k concurrent keep-alived connections to the server, request the server to return string of length randomly between 1 ~ 4096 bytes, read the response, idle 5s ~ 45s (randomly pick a value between), request again.


[output:](blog/600k/test_output)

{% highlight sh %}
time 0s, concurrency: 100, total requests: 0, thoughput: 0.00M/s, 0.00 requests/seconds
time 40s, concurrency: 164000, total requests: 230142, thoughput: 11.78M/s, 5688.28 requests/seconds
...
time 89s, concurrency: 340100, total requests: 788985, thoughput: 18.23M/s, 8812.23 requests/seconds
...
time 179s, concurrency: 595166, total requests: 2483174, thoughput: 28.61M/s, 13837.77 requests/seconds
time 180s, concurrency: 597853, total requests: 2506378, thoughput: 28.71M/s, 13888.67 requests/seconds
time 183s, concurrency: 600000, total requests: 2529020, thoughput: 28.52M/s, 13788.14 requests/seconds
time 185s, concurrency: 600000, total requests: 2537212, thoughput: 28.20M/s, 13680.42 requests/seconds
...
time 930s, concurrency: 600000, total requests: 17457773, thoughput: 38.64M/s, 18763.53 requests/seconds
time 931s, concurrency: 600000, total requests: 17477678, thoughput: 38.69M/s, 18764.73 requests/seconds
{% endhighlight %}

### How about ab test when 600k connections are kept

Issue this command from command line:

{% highlight sh %}
ab -n 100000 -c 10 -k http://127.0.0.1:8000/
{% endhighlight %}

output: [ab output](blog/600k/ab_results)

{% highlight sh %}
Server Software:        http-kit
Server Hostname:        127.0.0.1
Server Port:            8000

Document Path:          /
Document Length:        1024 bytes

Concurrency Level:      10
Time taken for tests:   3.184 seconds
Complete requests:      100000
Failed requests:        0
Write errors:           0
Keep-Alive requests:    100000
Total transferred:      117000000 bytes
HTML transferred:       102400000 bytes
Requests per second:    31405.53 [#/sec] (mean)
Time per request:       0.318 [ms] (mean)
Time per request:       0.032 [ms] (mean, across all concurrent requests)
Transfer rate:          35883.27 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       0
Processing:     0    0   9.3      0     913
Waiting:        0    0   9.3      0     913
Total:          0    0   9.3      0     913

Percentage of the requests served within a certain time (ms)
  50%      0
  66%      0
  75%      0
  80%      0
  90%      0
  95%      0
  98%      0
  99%      0
 100%    913 (longest request)
{% endhighlight %}

### The Clojure Server's CPU usage

jvisualvm's [snapshot file](blog/600k/jvisualvm_snapshort.apps).

[![cpu usage](blog/600k/cpu.png)](blog/600k/cpu.png)

### The Clojure Server's heap usage

[![heap memory usage](blog/600k/heap_usage.png)](blog/600k/heap_usage.png)

### Run it yourself

The complete test code is available on [github](https://github.com/http-kit/scale-clojure-web-app). Checkout and run it yourself!

To report a bug, or general discussion: [https://github.com/http-kit/scale-clojure-web-app/issues](https://github.com/http-kit/scale-clojure-web-app/issues
)
