require 'yaml'
require 'json'

File.open(ARGV[0].gsub('yml', 'json'), 'w') do |file|
  file.write JSON.pretty_generate YAML.load ARGF.read
end