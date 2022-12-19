import {
  http,
  HttpRequest,
  HttpRequestMethod,
  HttpHeader,
  HttpResponse,
} from "@minecraft/server-net";

import { States } from "./States";

class Network {
  constructor() {
    this.States = States;
    //2 = Login Request, 1 = Update Player List, 0 = Create Session Key
    this.Packet = {
      Type: 0,
      Key: key,
      PlayerId: "",
      Username: "",
      Players: [],
    };
    this.Http = http;
  }

  Login(player) {
    //Setup Packet
    var packet = this.Packet;
    packet.Type = 2;
    packet.Key = this.States.Key;

    //Setup request.
    var request = new HttpRequest(`http://${this.States.Ip}/`)
      .setTimeout(5)
      .setBody(JSON.stringify(packet))
      .setMethod(HttpRequestMethod.POST)
      .setHeaders([new HttpHeader("Content-Type", "application/json")]);

    //Send Request and respond to player.
    this.Http.request(request).then((out) => {
      if (out.status == 202) {
        this.States.isConnected = true;
        player.tell("§aLogin Accepted. Server successfully linked!");
      } else {
        this.States.isConnected = false;
        player.tell("§cLogin Denied. Server denied link request!");
      }
    });
  }

  SendSessionKeyRequest(player) {
    //Setup Packet
    var packet = this.Packet;
    packet.Type = 0;
    packet.Username = player.name;
    packet.Key = this.States.Key;

    //Setup request.
    var request = new HttpRequest(`http://${this.States.Ip}/`)
      .setTimeout(5)
      .setBody(JSON.stringify(packet))
      .setMethod(HttpRequestMethod.POST)
      .setHeaders([new HttpHeader("Content-Type", "application/json")]);

    //Send request and respond to player.
    this.Http.request(request).then((out) => {
      if (out.status == 200) {
        player.tell(`§aRequest Accepted. Your key is: ${out.body}`);
      } else {
        player.tell("§cConflict detected! Could not create new session key!");
      }
    });
  }

  SendUpdatePacket(Players) {
    //Setup the packet;
    var packet = this.Packet;
    packet.Type = 1;
    packet.Players = Players;
    packet.Key = this.States.Key;

    //Setup request.
    var request = new HttpRequest(`http://${this.States.Ip}/`)
      .setTimeout(5)
      .setBody(JSON.stringify(packet))
      .setMethod(HttpRequestMethod.POST)
      .setHeaders([new HttpHeader("Content-Type", "application/json")]);

    //Send request.
    http.request(request).then((out) => {
      if (out.status != 202) this.States.isConnected = false;
    });
  }
}

export { Network };

/*
Player Packet

var player = {
    PlayerId: "",
    Location: {
        X: 0,
        Y: 0,
        Z: 0,
      },
};
*/
