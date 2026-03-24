const esbuild = require('esbuild');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
    // Build extension main bundle
    const extCtx = await esbuild.context({
        entryPoints: ['src/extension.ts'],
        bundle: true,
        format: 'cjs',
        minify: production,
        sourcemap: !production,
        sourcesContent: false,
        platform: 'node',
        outfile: 'dist/extension.js',
        external: ['vscode'],
        logLevel: 'info',
    });

    // Build test runner bundle
    const testCtx = await esbuild.context({
        entryPoints: ['test/runTest.ts'],
        bundle: true,
        format: 'cjs',
        minify: false,
        sourcemap: true,
        platform: 'node',
        outfile: 'dist/test/runTest.js',
        external: ['vscode', '@vscode/test-electron'],
        logLevel: 'info',
    });

    // Build test suite bundle
    const suiteCtx = await esbuild.context({
        entryPoints: ['test/suite/index.ts'],
        bundle: true,
        format: 'cjs',
        minify: false,
        sourcemap: true,
        platform: 'node',
        outfile: 'dist/test/suite/index.js',
        external: ['vscode', 'mocha'],
        logLevel: 'info',
    });

    const testSuiteFiles = [
        'test/suite/extension.test.ts',
        'test/suite/deployer.test.ts',
        'test/suite/participant.test.ts',
        'test/suite/promptLoader.test.ts',
    ];

    const suiteBuilds = await Promise.all(
        testSuiteFiles.map(f =>
            esbuild.context({
                entryPoints: [f],
                bundle: true,
                format: 'cjs',
                minify: false,
                sourcemap: true,
                platform: 'node',
                outfile: `dist/${f.replace('.ts', '.js').replace('test/', 'test/')}`,
                external: ['vscode', 'mocha'],
                logLevel: 'silent',
            })
        )
    );

    if (watch) {
        await Promise.all([
            extCtx.watch(),
            testCtx.watch(),
            suiteCtx.watch(),
            ...suiteBuilds.map(c => c.watch()),
        ]);
        console.log('Watching for changes...');
    } else {
        await Promise.all([
            extCtx.rebuild(),
            testCtx.rebuild(),
            suiteCtx.rebuild(),
            ...suiteBuilds.map(c => c.rebuild()),
        ]);
        await Promise.all([
            extCtx.dispose(),
            testCtx.dispose(),
            suiteCtx.dispose(),
            ...suiteBuilds.map(c => c.dispose()),
        ]);
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
