const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./settings.json');

const config = require("./package.json");
var path = "C:\Drafts"
var fs = require('fs');
var chan
var i = 0;
var currlob = 0;
var actlobby;
var inter = null;
var lobnum = -1;
var Alobby = [];
var lobexists = 0;
var timerstarted = 0;
var file;

function drafts(chan){
    this.lobby = chan;
    this.picknum = 1;
    this.teamnum = 0;
    this.timer = 60;
    this.teamsready = 0;
    this.draftstart = 0;
    this.draftfault = 0;
    this.herobans = 1
    this.pausedraft = 0;
    this.teams = {
        1: null,
        2: null};
    this.Abans = {
        1: null,
        2: null};
    this.Apicks = {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null};
}


client.on('ready', () => {
    console.log('Bot online');
});

const prefix = "!";


function Timer(message) {
    for (i = 0; i < currlob; i ++){
        if(Alobby[i].draftstart === 0 || Alobby[i].draftfault === 1) continue;
        else if(Alobby[i].pausedraft === 1 ) {
            Alobby[i].timer++;
            continue;
        }
        else if(Alobby[i].timer > 5){
            if(Alobby[i].timer == 10)
                Alobby[i].lobby.sendMessage(Alobby[i].timer + ' sec');
            if(Alobby[i].timer % 15 == 0){
                Alobby[i].lobby.sendMessage(Alobby[i].timer + ' sec');
            }
        }
        else if(Alobby[i].timer <= 0){
            Alobby[i].lobby.sendMessage('Draft fault: no hero selected in time')
            Alobby[i].lobby.sendMessage("Draft will continue on !resume call");
            Alobby[i].draftfault = 1;
        }
        else
            Alobby[i].lobby.sendMessage(Alobby[i].timer + ' sec');
        Alobby[i].timer--;

    }
}


client.on('message', message => {
    if(!message.content.startsWith(prefix)) return; 
    if(message.author.bot) return;
    let command = message.content.split(" ")[0];
    command = command.slice(prefix.length);
    let args = message.content.split(" ").slice(1);
    for (i = 0; i < currlob; i ++){
        if(Alobby[i].lobby === message.channel) {
            lobexists = 1;
            actlobby = Alobby[i];
            lobnum = i + 1;
        }
    }

    if(command.toLowerCase() === "pick") {
        if(!lobexists) {
            lobexists = 0;
            return;
        }
        if(actlobby.herobans < 2) return;
        let nameArray = args.map(n=> n);
        if (nameArray.length === 0) return;
        let picks = nameArray.reduce( (p, c) => p + " " + c);
        if(actlobby.picknum % 2 == 0)
            actlobby.teamnum = 2;
        else   
            actlobby.teamnum = 1;
        actlobby.lobby.sendMessage(actlobby.teams[actlobby.teamnum] + " selected " + picks);
        actlobby.Apicks[actlobby.picknum] = picks;
        actlobby.timer = 60;
        actlobby.picknum++;
        if(actlobby.picknum > 6)
        {
            actlobby.lobby.sendMessage("Draft finished");
            actlobby.picknum = 1;
            actlobby.timer = 60;
            actlobby.lobby.sendMessage(actlobby.teams[1] + " Ban: \t" + actlobby.Abans[1] + "\r\n" + actlobby.teams[2] + " Ban: \t" + actlobby.Abans[2]);
            actlobby.lobby.sendMessage(actlobby.teams[1] + ": \t" + actlobby.Apicks[1] + "\r\n" + actlobby.teams[2] +": \t" + actlobby.Apicks[2] + "\r\n" + actlobby.teams[1] + ": \t" + actlobby.Apicks[3] 
                                      + "\r\n" + actlobby.teams[2] +": \t" + actlobby.Apicks[4] + "\r\n" + actlobby.teams[1] + ": \t" + actlobby.Apicks[5] + "\r\n" + actlobby.teams[2] + ": \t" + actlobby.Apicks[6]);
            
            client.clearInterval(inter);
            Alobby.splice(lobnum - 1, 1);
            currlob--;
            inter = setInterval(Timer, 1000, message);
        }
    }
    else if(command.toLowerCase() === "ready"){
        if(!lobexists) {
            lobexists = 0;
            return;
        }
        let nameArray = args.map(n=> n);
        if (nameArray.length === 0) return;
        if(actlobby.teamsready === 2) return;
        actlobby.teamsready++;
        let teamname = nameArray.reduce( (p, c) => p + " " + c);
        actlobby.teams[actlobby.teamsready] = teamname;
        actlobby.lobby.sendMessage(actlobby.teams[actlobby.teamsready] +  ' Ready');
        
        
    }
    else if(command.toLowerCase() === "startdraft"){
        if(!lobexists) {
            lobexists = 0;
            return;
        }
        if(actlobby.teamsready < 2 ) return;
        if(timerstarted === 0){
            inter = setInterval(Timer, 1000, message);
            timerstarted = 1;
        }
        actlobby.timer = 60;
        actlobby.lobby.sendMessage('Draft started');
        actlobby.draftstart = 1;
    }
    else if(command.toLowerCase() === "reset"){
        if(!lobexists) {
            lobexists = 0;
            return;
        }
        actlobby.picknum = 1;
        actlobby.timer = 60;
        actlobby.teamsready = 0;
        actlobby.draftstart = 0;
        actlobby.draftfault = 0;
        actlobby.picknum = 1;
        actlobby.herobans = 1;
        actlobby.teamnum = 0;
    }
    else if(command.toLowerCase() === "resume"){
        if(!lobexists) {
            lobexists = 0;
            return;
        }
        if(actlobby.draftfault < 1) return;
        actlobby.timer = 60;
        actlobby.draftfault = 0;

        
    }
    else if(command.toLowerCase() === "ban"){
        if(!lobexists) {
            lobexists = 0;
            return;
        }
        if(actlobby.draftstart < 1) return;
        if(actlobby.herobans === 3) return;
        let nameArray = args.map(n=> n);
        if (nameArray.length === 0) return;
        let bans = nameArray.reduce( (p, c) => p + " " + c);
        actlobby.lobby.sendMessage(actlobby.teams[actlobby.herobans] + " banned " + bans);
        actlobby.Abans[actlobby.herobans] = bans;
        actlobby.herobans++;
        actlobby.timer = 60;
    }
    else if(command.toLowerCase() === "lobby"){
        if(lobexists) {
            lobexists = 0;
            return;
        }
        Alobby[currlob] = new drafts(message.channel);
        currlob++;  
        
    }
    else if(command.toLowerCase() === "botrefresh"){
        client.clearInterval(inter);
        i = 0;
        currlob = 0;
        actlobby = {};
        lobnum = -1;
        Alobby = [];
        lobexists = 0;
        timerstarted = 0;
    }
    else if(command.toLowerCase() === "pause"){
        actlobby.pausedraft ^= 1;
    }
    else if(command.toLowerCase() === "edit"){
        if(!lobexists) {
            lobexists = 0;
            return;
        }
        let item = args[0];
        let location = args[1];
        let value = args[2];
        if(args.length === 4)
            value += " " + args[3];
        if(item.toLowerCase() === "ban"){
            actlobby.Abans[location] = value;
        }
        else if(item.toLowerCase() === "pick"){
            actlobby.Apicks[location] = value;
        }
    }
    lobexists = 0;
});

client.login(settings.token);