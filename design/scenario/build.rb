require 'yaml'
require 'json'

def exchange(yml_path, json_path)
  File.open(json_path, 'w') do |file|
    file.write JSON.generate YAML.load_file yml_path
    puts "[INFO] success to create json file " + json_path
  end
rescue => e
  puts "[WARN] " + e.to_s
end

Dir.glob("**/*.yml").each do |yml|
  puts "[TRACE]find yml file " + yml
  ys = File::Stat.new yml
  json_path = yml.gsub('yml', 'json')
  if File.exist? json_path
    js = File::Stat.new json_path
    if ys.mtime > js.mtime
      exchange yml, json_path
    else
      puts "[INFO] skip to create json file " + json_path
    end
  else
    exchange yml, json_path
  end
end

#File.open(ARGV[0].gsub('yml', 'json'), 'w') do |file|
#  file.write JSON.pretty_generate YAML.load ARGF.read
#end