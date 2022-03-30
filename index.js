const axios = require('axios');
const sanityClient = require('@sanity/client')
const { uuid } = require('@sanity/uuid')

const client = sanityClient({
  projectId: '52jbeh8g',
  dataset: 'production',
  apiVersion: '2022-03-29',
  token: 'skA85UcAJlVuOBMWsda8D90xKAEKbaFiSz3Lluuu6t3lEGlAuKFGhNb5byl50yl8ltTMBwkOP3LxNXNCLj6b9fmu9z1J3hk8J1SAUBYWsCCTkAxl9ja0soONhnXJcl1Ki8CH9C3v87z7g9okgknko1Q4HZAcv9EDydqf5bRlAaSYI3LfsAKL',
  useCdn: false
})


const URL = "https://t9pcfr15ph.execute-api.us-east-1.amazonaws.com/prod/fetchdatafrommasterdb?PHONE=";

const importDataToSanity = async (jsonData) => {
  const result = await client.createOrReplace({ 
    _id: `${uuid()}`,
    _type: 'post', ...jsonData })
  console.log(result);
}

const getJSONdataByPhoneNumber = async (phoneNumber) => {
  let res = await axios.get(URL + phoneNumber);
  let data = res.data;
  console.log("API data", data.last3_month_frequency)
  importDataToSanity(data)
}



getJSONdataByPhoneNumber(6275383);
