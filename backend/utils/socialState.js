function toggleId(list = [], id) {
  if (list.includes(id)) {
    return {
      list: list.filter((item) => item !== id),
      active: false,
    };
  }

  return {
    list: [...list, id],
    active: true,
  };
}

function updateCounter(currentValue = 0, active) {
  return active ? currentValue + 1 : Math.max(0, currentValue - 1);
}

module.exports = {
  toggleId,
  updateCounter,
};
