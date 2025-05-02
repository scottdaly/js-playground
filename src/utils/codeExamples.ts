export const defaultCode = `
console.log("Hello, world!");
`;

export const examples = [
  {
    name: "Hello World",
    code: `console.log("Hello, world!");`,
  },
  {
    name: "Factorial Function",
    code: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));
console.log("Factorial of 10:", factorial(10));`,
  },
  {
    name: "Array Methods",
    code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Filter even numbers
const evenNumbers = numbers.filter(n => n % 2 === 0);
console.log("Even numbers:", evenNumbers);

// Map to square each number
const squares = numbers.map(n => n * n);
console.log("Squares:", squares);

// Reduce to calculate sum
const sum = numbers.reduce((total, n) => total + n, 0);
console.log("Sum of all numbers:", sum);`,
  },
  {
    name: "Error Handling",
    code: `try {
  // This will throw an error
  const result = undefinedVariable + 10;
  console.log("This won't execute");
} catch (error) {
  console.error("Caught an error:", error.message);
} finally {
  console.log("This always executes");
}`,
  },
];
