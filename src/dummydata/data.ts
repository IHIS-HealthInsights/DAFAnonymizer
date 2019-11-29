const data = [];
const generateNRIC = () => {
  return (
    "S" + String(Math.floor(Math.random() * 10000000)).padEnd(7, "0") + "X"
  );
};

for (let i = 0; i < 5; i++) {
  data.push({
    key: i,
    nric: generateNRIC() + " Hello",
    name: "Name" + i
  });
}

export default data;
