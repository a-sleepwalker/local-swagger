const router = require('koa-router')();
const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const readFileAsync = promisify(fs.readFile);
const CONFIG_PATH = path.join(__dirname, '../public/conf/conf.yml');

router.get('/editor_config', async (ctx, next) => {
    try {
        ctx.set('content-type', 'application/yaml');
        ctx.body = await readFileAsync(CONFIG_PATH, {
            encoding: 'utf-8',
            flag: 'r'
        });
    } catch (e) {
        ctx.body = {
            code: 'app-50x',
            message: e.message
        };
    }
});

router.put('/editor_config', async (ctx, next) => {
    if (ctx.is('application/*') && ctx.accepts('application/*')) {
        let result = await new Promise((resolve, reject) => {
            try {
                let ws = fs.createWriteStream(CONFIG_PATH);
                ctx.req.pipe(ws);
                resolve('finished');
            } catch (e) {
                reject(e.message)
            }
        });
        if (result === 'finished') {
            ctx.body = {
                message: 'done',
                code: 'app-200'
            };
        } else {
            ctx.body = {
                message: result,
                code: 'app-500'
            };
        }
    } else {
        ctx.body = {
            message: 'invalid content type',
            code: 'app-505'
        };
    }
});
module.exports = router;
