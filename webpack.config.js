module.exports = {
  plugins: [
    new (require('webpack').DefinePlugin)({
      'process.env': JSON.stringify(process.env)
    })
  ]
};
