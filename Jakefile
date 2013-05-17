var $NL = ' \\';
var $compiler = 'lib/closure-compiler/compiler.jar';
var $tenjohFiles = {
    'Tenjoh.js': [
        'src/Tenjoh.js',
        'src/component/Array.js',
        'src/component/DOM.js',
        'src/component/Event.js',
        'src/component/XHR.js',
        'src/component/Router.js',
        'src/component/Cache.js',
        'src/component/Storage.js',
        'src/component/ResourceManager.js',
        'src/component/Compiler.js',
        'src/component/UI/UIFactory.js',
        'src/component/UI/Partial.js',
        'src/component/UI/Fillter.js',
        'src/component/UI/Animation.js',
        'src/component/UI/LayeredImage.js',
        'src/widget/Repeat.js',
        'src/widget/LazyImage.js',
        'src/widget/Show.js',
        'src/widget/Hide.js',
        'src/fillter/Element.js',
        'src/fillter/DateFormatter.js',
        'src/fillter/Before.js',
        'src/fillter/NumberFormatter.js',
        'src/RootController.js',
        'src/Controller.js'
    ]
};

desc('Build Tenjoh-fw.');
task('default', ['compile'], function () {});

desc('Clean build/ directory.');
task('clean', [], function () {
    var cmd = [
        'rm -rf build/*'
    ];

    console.log('Clean build/ directory.');
    jake.exec(cmd, {stdout: true});
});

desc('Concat Tenjoh source.');
task('concat', ['clean'], function () {
    var cmd = [], buff;
    buff = 'cat ';
    for (var group in $tenjohFiles) {
        for (var i = 0; i < $tenjohFiles[group].length; i++) {
            buff += $tenjohFiles[group][i] + ' ';
        }
        buff += '>> build/' + group;
        cmd.push(buff);
    }
    cmd.push('cat src/bootstrap.js > build/bootstrap.js');

    console.log('Concat Tenjoh source.');
    jake.exec(cmd, {stdout: true});
});


desc('Compile Tenjoh source.');
task('compile', ['concat'], function () {
    var cmd = [], buff;
    for (var group in $tenjohFiles) {
        buff  = 'java -jar ' + $compiler + ' ';
        buff += '--compilation_level SIMPLE_OPTIMIZATIONS ';
        buff += '--language_in ECMASCRIPT5_STRICT ';
        buff += '--js build/' + group + ' ';
        buff += '--js_output_file ' + group.replace('.js', '.min.js');
        cmd.push(buff);
    }
    cmd.push('cat src/bootstrap.js > build/bootstrap.js');

    console.log('Compile Tenjoh source.');
    jake.exec(cmd, {stdout: true});
});
