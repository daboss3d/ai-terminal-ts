import enquirer from "enquirer";

console.log("Enquirer keys:", Object.keys(enquirer));
console.log("Enquirer type:", typeof enquirer);
if (typeof enquirer === 'function') {
  console.log("Enquirer function length:", enquirer.length);
} else if (typeof enquirer === 'object') {
  console.log("Enquirer properties:", Object.getOwnPropertyNames(enquirer));
}