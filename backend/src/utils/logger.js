const log = (message) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
};

const logTable = (data) => {
  if (process.env.NODE_ENV !== "production") {
    console.table(data);
  }
};

module.exports = {
  log,
  logTable,
};