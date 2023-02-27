/**
 * Handles promises in a more
 * elegant way.
 *
 * @param {*} promise
 * @returns
 */
const resolve = async (promise) => {
  try {
    const result = await promise;

    return [result, null];
  } catch (error) {
    console.log(error)
    return [null, result];
  }
};

module.exports = resolve;
