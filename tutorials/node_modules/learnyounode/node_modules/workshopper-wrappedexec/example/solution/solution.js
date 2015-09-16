var strings = process.argv.slice(2);
var lengths = strings.map(function (string) {
  return string.length;
});
console.log(JSON.stringify(lengths));