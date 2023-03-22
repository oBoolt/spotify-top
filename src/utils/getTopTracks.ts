import axios from "axios";
import { join } from "path";
import { UsersTopTracksResponse } from "../types";
import jsonFile, { UserType } from "./jsonFile";

export default async function getTopTracks(
  user_id: string,
  api_link: string,
  users: UserType[],
  playlist_id: string,
  limit: number,
  time_range: string
) {
  // Current User
  let currentUser: UserType | undefined = users.find((e) => e.id === user_id);
  const currentUserIndex: number = users.findIndex((e) => e.id === user_id);
  // Variable that counts how many requests you make to the spotify api
  let counter = 0;
  // Api
  const api = axios.create({
    baseURL: api_link,
    headers: {
      Authorization: "Bearer " + currentUser!.accessToken,
    },
  });

  api.interceptors.request.use(
    async function (config) {
      const serialize = function (obj: any) {
        var str = [];
        for (var p in obj) {
          if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          }
        }
        return str.join("&");
      };

      if (counter === 0) {
        const refreshToken = currentUser!.refreshToken;
        const newAccessToken = await axios.post(
          "https://accounts.spotify.com/api/token",
          serialize({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
              ).toString("base64")}`,
            },
          }
        );

        config.headers.Authorization = `Bearer ${newAccessToken.data.access_token}`;

        currentUser = {
          accessToken: newAccessToken.data.access_token,
          refreshToken,
          expires_in: newAccessToken.data.expires_in,
          id: currentUser!.id,
        };

        await users.splice(currentUserIndex, 1);
        await users.push(currentUser);
        jsonFile.saveJSON(join(process.cwd(), "users.json"), users);
        currentUser = users.find((e) => e.id === user_id);
      }

      counter++;
      return config;
    },
    function (error) {
      console.log(error.response);
      return Promise.reject(error);
    }
  );

  // Date
  const date = new Date();
  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  // Time
  const time: any = {
    short_term: "Short Term (1 Month)",
    medium_term: "Medium Term (6 Months)",
    long_term: "Long Term (All Time)",
  };

  // Top Tracks
  let topTracksList = [];
  const { data: topTracks } = await api.get<UsersTopTracksResponse>(
    `/me/top/tracks?limit=${limit}&time_range=${time_range}`
  );

  for (let i = 0; i < topTracks.items.length; i++) {
    topTracksList.push(topTracks.items[i].uri);
  }

  await api.put(`playlists/${playlist_id}/tracks`, {
    uris: topTracksList,
  });

  await api.put(`/playlists/${playlist_id}`, {
    name: `Top ${limit}`,
    description: `${formattedDate} | ${time[time_range]}`,
  });

  // console.log(topTracksList);
  console.log(
    `Last Update: ${formattedDate} \nTime Range: ${time[time_range]}`
  );

  // TODO Log System
}
