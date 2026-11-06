# Adds the UI test target to the generated (and git-ignored) Xcode project. Safe to run repeatedly.
require 'xcodeproj'

project = Xcodeproj::Project.open(Dir['ios/*.xcodeproj'].first)
app = project.targets.find { |t| t.product_type == 'com.apple.product-type.application' }
name = 'FerruleHarnessUITests'
target = project.targets.find { |t| t.name == name }
unless target
  target = project.new_target(:ui_test_bundle, name, :ios, '16.0')
  target.add_dependency(app)
  file = project.main_group.new_file(File.expand_path("#{name}.swift", __dir__))
  target.add_file_references([file])
end
target.build_configurations.each do |config|
  config.build_settings.merge!(
    'PRODUCT_NAME' => name,
    'IPHONEOS_DEPLOYMENT_TARGET' => '16.4',
    'TEST_TARGET_NAME' => app.name,
    'PRODUCT_BUNDLE_IDENTIFIER' => 'dev.ferrule.harness.uitests',
    'SWIFT_VERSION' => '5.0',
    'GENERATE_INFOPLIST_FILE' => 'YES',
    'CODE_SIGNING_ALLOWED' => 'NO',
  )
end
project.save

scheme = Xcodeproj::XCScheme.new
scheme.add_test_target(target)
scheme.save_as(project.path, name, true)
