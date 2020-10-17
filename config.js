const fs = require('fs')
const jsonConfig = JSON.parse(fs.readFileSync('env.json'));

module.exports.fetchEnvTwo = () => {
    return !!jsonConfig ? jsonConfig.envTwo : undefined;
 }