import b from "./b.js";

const message = import("./c.js").then(c => c.default + b);

export default message;
