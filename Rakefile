require 'fileutils'


RLS_PATH = "_releases"
RLS_IGNORE = ["#{RLS_PATH}/*", ".git*", "*.DS_Store", "Rakefile"]


desc "Build a release package"
task :release do
  FileUtils.mkdir_p(RLS_PATH)
  file = File.read("suggest_results/jquery.suggest_results.js")
  if file =~ /\* Suggest Results v([0-9\.]+)\n/
    version = $1
    target = "#{RLS_PATH}/jquery.suggest_results-#{version}.zip"
    if File.exist?(target)
      puts "ERROR: #{target} already exists."
    else
      ignore = RLS_IGNORE.map { |i| "-x \"#{i}\"" }.join(" ")
      system("zip #{ignore} -r #{target} .")
      puts "packaged #{target}"
    end
  end
end

desc "Update demo page."
task :demo do
  rsync(".", "jimeh@jimeh.me:jimeh.me/files/projects/suggest_results", ["--exclude='#{RLS_PATH}'", "--delete"])
end



def rsync(source, dest, options = [])
  if source.is_a?(Array)
    source.map! { |dir, i| "\"#{dir}\"" }
    source = source.join(" ")
  end
  options << "--exclude='.DS_Store'"
  options << "--exclude='.git*'"
  system "rsync -vr #{options.join(" ")} #{source} #{dest}"
end