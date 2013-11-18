require 'tempfile'
require 'rubygems'
require 'date'

desc 'Deploy'
task :deploy => [:clean, :compress] do
  sh "bin/deploy"
end

desc 'Compile scss, Compress generated css'
task :css do
  sh "mkdir -p css"
  sh "mkdir -p _site/css"
  scss = FileList['scss/**/*.scss'].exclude('scss/**/_*.scss')
  scss.each do |source|
    target = source.sub(/\.scss$/, ".css").sub(/^scss/, 'css')
    sh "sass -t compressed --cache-location /tmp #{source} #{target}"
  end
  sh "cp css/site.css _site/css/site.css"
end

desc "Delete generate files"
task :clean do
  sh "rm css -rf"
  sh "rm _site -rf"
end

desc "Generate site"
task :generate do
  sh "jekyll build"
end

desc "Watch for change"
task :watch => :generate do
    sh "http-watcher -port 8081 -ignores _site,.git -command ./preprocess"
end

desc "Compress html"
task :compress => :generate do
  html_srcs = FileList['_site/**/*.html']
  html_srcs.each do |h|
    sh "java -jar bin/htmlcompressor-1.3.1.jar --charset utf8 #{h} -o #{h}"
  end
end


# sudo gem install jekyll
# sudo apt-get install python-pygments
# sudo gem install liquid --version '2.2.2'
