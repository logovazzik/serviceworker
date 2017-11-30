var showNotification = (function(){
    var applyTemplate = function (template, replacements) {
        return template.replace(/{(\w+)}/g, function (e, n) {
            return undefined !== replacements[n] ? encodeURIComponent(replacements[n]) : "";
        });
    };
    var isToday = function(day) {
        return new Date().getDate() === day;
    }
    var getDateString =  function(dateString){
        if(!dateString){
            return '';
        }

        var dateTemplate = '{dd}.{MM}.{YY}';
        var timeTemplate  = '{HH}:{mm}';
        var dateParsed = new Date(dateString);
        var dateParsedDay = dateParsed.getDate();
        var prefixZero = function(value){
            if(value < 10) {
                return '0' + value;
            }
            return value;
        };
       var template = isToday(dateParsedDay) ? timeTemplate: dateTemplate + ' ' + timeTemplate;
        return applyTemplate(template, {
            dd: prefixZero(dateParsedDay),
            MM: prefixZero(dateParsed.getMonth() + 1),
            YY: dateParsed.getFullYear().toString().substr(-2),
            HH: prefixZero(dateParsed.getHours()),
            mm: prefixZero(dateParsed.getMinutes())
        })
    };
    
    return function(registration, payload) {
        return registration.showNotification(
            payload.data.title,
             {
                 body: getDateString(payload.data.dateTime) + ' ' + payload.data.body,
                 icon: payload.data.icon
            });
        
    }
})();
