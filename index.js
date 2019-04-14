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
        let xpFarmed = 0;
        xp.forEach(p => xpFarmed += p.gained)

        return xpFarmed;
    }
    
    function getXpPastHour() {
        let xpPastHour = xp.filter(p => p.time - (Date.now() - 3600000) > 0);
        let xpFarmed = 0;
        xpPastHour.forEach(p => xpFarmed += p.gained)
        
        return xpFarmed;
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
        }
        
        mod.command.message("XP/Hour: ".clr("FDD017") + formatXp(xpPerHour()).toString().clr("00FFFF"));
        mod.command.message("XP gained: ".clr("FDD017") + formatXp(getTotalXp()).clr("00FFFF"));
        
        if (startTime - (Date.now() - 3600000) < 0) {
            mod.command.message("Total Avg: ".clr("FDD017") + formatXp(getTotalXp() / ((Date.now() - startTime) / 3600000)).clr("00FFFF"));
        }
        mod.command.message("Session playtime: ".clr("FDD017") + msToTime(Date.now() - startTime).clr("56B4E9"));     
        if (playerExp) {
            let remainingXp = Number(playerExp.nextLevelEXP - playerExp.levelEXP);
            mod.command.message("Remaining XP: ".clr("FDD017") + formatXp(remainingXp).clr("00FFFF"));
            mod.command.message("ETA until Level: ".clr("FDD017") + msToTime(remainingXp / xpPerHour() * 3600000).clr("56B4E9"));
        }
    });
    
    function formatXp(xpValue) {
        let format;
        
        if (mod.settings.shortUnits) {
            if (xpValue >= 1000000000) {
                format = xpValue * 0.000000001;
            } else if (xpValue >= 1000000) {
                format = xpValue * 0.000001;             
            } else if (xpValue >= 1000) {                
                format = xpValue * 0.001;
            } else {
                format = xpValue.toFixed();           
            }            
        } else {
            format = xpValue.toFixed();
        }
        
        if (mod.settings.commaSeparators) format = format.toLocaleString('en');        
            
        if (mod.settings.shortUnits) {
            if (xpValue >= 1000000000) {
                format += "B";
            } else if (xpValue >= 1000000) {
                format += "M";             
            } else if (xpValue >= 1000) {                
                format += "K";
            }           
        }
        
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
