const axios = require('axios')
const qs = require('qs')

const id = require('./id')


const authOptions = {
  method: "POST",
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + (new Buffer(id.client_id + ':' + id.client_secret).toString('base64')) },
    data: qs.stringify({'grant_type': 'client_credentials'}),
}

async function getEpisode (){
  try{
  const responseAuth =  await axios(authOptions)

      const options = {
        method: "GET",
        url: `https://api.spotify.com/v1/shows/${id.show_id}/episodes?offset=0&limit=1&market=BR`,
        headers: {
         'Authorization': 'Bearer ' + responseAuth.data.access_token
       },
      };

    const responseEp = await axios(options)
    return responseEp.data
  } catch(err){
    console.log(err);
  }
};


module.exports = getEpisode
