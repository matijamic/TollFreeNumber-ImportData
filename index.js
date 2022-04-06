const axios = require("axios");
const sanityClient = require("@sanity/client");
const { uuid } = require("@sanity/uuid");
const fs = require("fs");
const excelToJson = require("convert-excel-to-json");
const throttledQueue = require("throttled-queue");

let throttle = throttledQueue(15, 1000);

const client = sanityClient({
  projectId: "52jbeh8g",
  dataset: "production",
  apiVersion: "2022-03-29",
  token:
    "skA85UcAJlVuOBMWsda8D90xKAEKbaFiSz3Lluuu6t3lEGlAuKFGhNb5byl50yl8ltTMBwkOP3LxNXNCLj6b9fmu9z1J3hk8J1SAUBYWsCCTkAxl9ja0soONhnXJcl1Ki8CH9C3v87z7g9okgknko1Q4HZAcv9EDydqf5bRlAaSYI3LfsAKL",
  useCdn: false,
});

const URL =
  "https://t9pcfr15ph.execute-api.us-east-1.amazonaws.com/prod/fetchdatafrommasterdb?PHONE=";

// generate Numbers JSON from Excel File

// const result = excelToJson({
//   sourceFile: "list.xlsx",
//   sheets: [
    
//     {
//       name: "Sheet2",
//       columnToKey: {
//         A: "PHONE",
//       },
//     }
//   ],
// });

// let file = fs.createWriteStream('array.txt');

// const getItemFromJSON = (phoneNumberList) => {
//   phoneNumberList.Sheet2.map((key, value) => file.write(key.PHONE + '\n'));
  
//   console.log("Extracted PhoneNumbers From Excel");
// };


// getItemFromJSON(result);


const deleteSanityContents = () => {
  client
    .delete({ query: '*[_type == "post"][0...999]' })
    .then(console.log("deleted Contents"))
    .catch(console.error);
};

let errListFile = fs.createWriteStream('err.txt');
const importDataToSanity = async (phoneNumber, jsonData) => {
  try {
    const result = await client.createOrReplace({
      _id: `${uuid()}`,
      _type: "post",
      title: phoneNumber,
      ...jsonData,
    });
    let filedata = fs.readFileSync("array.txt", 'utf-8');

    // replace 'world' together with the new line character with empty
    let newValue = filedata.replace(`/${phoneNumber}\n/`, '');
    fs.writeFileSync("array.txt", newValue, 'utf-8');
    console.log("success => ", phoneNumber)

  } catch (err) {
    errListFile.write(phoneNumber + '\n');
    console.log("import Err", err.statusCode);

  }
};

function getData(url, callback) {
  axios
    .get(url)
    .then((res) => {
      callback(res);
    })
    .catch(function (err) {
      console.log("Err -> " + url);
    });
}

const getJSONdataByPhoneNumber = async (phoneNumber) => {
  throttle(function () {
    getData(URL + phoneNumber, function (res) {
      importDataToSanity(phoneNumber.toString(), res.data);
    });
  });
};

const loadData = () => {
  const buffer = fs.readFileSync("array.txt");
  const fileContent = buffer.toString();
  const arr = fileContent.split("\n");
  arr.map((phoneNumber) => getJSONdataByPhoneNumber(phoneNumber));
};

// deleteSanityContents();
loadData();
