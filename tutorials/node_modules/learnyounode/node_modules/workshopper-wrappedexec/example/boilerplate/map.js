// sanity check command-line arguments
if (process.argv.length == 2) {
  return console.log('Please provide a list of strings');
}

// Array#slice() returns a new array starting from the
// specified index, so we can trim argv to just the
// additional arguments
var strings = process.argv.slice(2);

var lengths = [];

// populate the lengths array with the length of each string
for (var i = 0; i < strings.length; i++) {
  lengths[i] = strings[i].length;
}

// print out a JSON-encoded version of the array
var json = JSON.stringify(lengths);

console.log(json);