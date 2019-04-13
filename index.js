'use strict'
String.prototype.clr = function (hexColor) { return `<font color='#${hexColor}'>${this}</font>` };

module.exports = function XpInfo(mod) {
    let xp = [],
    startTime,
    playerExp;

    mod.hook('S_PLAYER_CHANGE_EXP', 1, (event) => {
        if (!mod.settings.enabled) return;
        
        playerExp = event;
        xp.push({gained: Number(event.gainedTotalEXP), time: Date.now()});
        if (mod.settings.showMessage) {
            mod.command.message("XP/Hour: " + formatXp(xpPerHour()).toString().clr("00FFFF"));
        }
    })

   function getTotalXp() {
        let result = 0;
        
        for(let i = 0; i < xp.length; i++) {
            result += xp[i].gained;
        }
        return result;
    }
    
    function getXpPastHour() {
        let xpPastHour = xp.filter(p => p.time - (Date.now() - 3600000) > 0);
        let result = 0;
        
        for(let i = 0; i < xpPastHour.length; i++) {
            result += xpPastHour[i].gained;
        }
        return result;
    }
 
    function xpPerHour() {
        return getXpPastHour() / ((Date.now() - startTime) / 3600000);
    }
    
    function resetMod() {
        xp = [];
        startTime = Date.now();
        playerExp = null;
    }
    
	mod.game.on('enter_game', () => {
        resetMod();
	})
    
    mod.command.add(['xp', 'xpinfo'], (arg) => {
        if (arg) arg = arg.toLowerCase();
        switch(arg) {
            case "reset":
            case "restart":
                resetMod();
                mod.command.message(("Resetted").clr('56B4E9'));
                return;
            case "on":
            case "enable":
                mod.settings.enabled = true;
                mod.command.message("Enabled".clr('56B4E9'));
                return;
            case "off":
            case "disable":
                mod.settings.enabled = false;
                mod.command.message("Disabled".clr('E69F00'));
                return;
            case "showmessage":
                mod.settings.showMessage = true;
                mod.command.message("Disabled".clr('56B4E9'));
                return;
            case "hidemessage":
                mod.settings.showMessage = false;
                mod.command.message("Disabled".clr('E69F00'));
                return;
        }
        
        mod.command.message("XP/Hour: ".clr("FDD017") + formatXp(xpPerHour()).toString().clr("00FFFF"));
        mod.command.message("XP gained: ".clr("FDD017") + formatXp(getTotalXp()).clr("00FFFF"));
        mod.command.message("Total Avg: ".clr("FDD017") + formatXp(getTotalXp() / ((Date.now() - startTime) / 3600000)).clr("00FFFF"));
        mod.command.message("Session playtime: ".clr("FDD017") + msToTime(Date.now() - startTime).clr("56B4E9"));     
        if (playerExp) {
            let remainingXp = Number(playerExp.nextLevelEXP - playerExp.levelEXP);
            mod.command.message("Remaining XP: ".clr("FDD017") + formatXp(remainingXp).clr("00FFFF"));
            mod.command.message("ETA until Level: ".clr("FDD017") + msToTime(remainingXp / xpPerHour() * 3600000).clr("56B4E9") + "           Hours: " +(remainingXp / getXpPastHour() * 3600000)   );
        }
    });
    
    function formatXp(xpValue) {
        let format = Number(mod.settings.unitInMillions ? (xpValue * 0.000001).toFixed(2) : xpValue.toFixed());        
        if (mod.settings.commaSeparators) format = format.toLocaleString('en');        
        if (mod.settings.unitInMillions) format += "M";
        
        if (playerExp) {
            format += " (" + (xpValue / Number(playerExp.nextLevelEXP) * 100).toFixed(2) + "%)";
        }
        
        return format;
    }
    
    function msToTime(duration) {
        var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)));

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + "h:" + minutes + "m:" + seconds + "s";
    }    
    
}
