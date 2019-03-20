
exports.commitPromise = async function (connection) {
  return new Promise((resolve, reject) => {
    connection.commit(function (err) {
      connection.release()
      if (err) {
        reject(error);
      }
      resolve();
    });
  })
}

exports.beginTransactionPromise = async function (connection) {
  return new Promise((resolve, reject) => {
    connection.beginTransaction(function (err) {
      if (err) {
        reject(error);
      }
      resolve();
    });
  })
}

exports.queryPromise = async function (connection, sql, args) {
  return new Promise((resolve, reject) => {
    connection.query(sql, args, function (error, results, fields) {
      if (error) {
        reject(error);
      };
      resolve(results)
    });
  })
}