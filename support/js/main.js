(function () {
    $('.goto-title').click(function() {
        location.href ="/achievement/title.html";
    });
    $('#toggleListEarned').click(function () {
        $('#achievementListEarned').show();
        $('#achievementListPreEarned').hide();
        $('#toggleListEarned').button('toggle');
        $('#toggleListPreEarned').button('toggle');
    });
    $('#toggleListPreEarned').click(function () {
        $('#achievementListEarned').hide();
        $('#achievementListPreEarned').show();
        $('#toggleListEarned').button('toggle');
        $('#toggleListPreEarned').button('toggle');
    });
    $('.achievements-list .item').click(function() {
        $('#achievementDialog').modal('show');
    });
})();

function achievementAsync() {
    $('.top-left').notify({
        message: { html:
            '<div class="container">' +
            '<div class="notify-icon pull-left">' +
            '<img src="/mobage/img/achievement/icon_achievement_01.jpg" alt="icon" />' +
            '<\/div>' +
            '<div class="notify-message pull-right">' +
            '<p class="notify-title">実績が解除されました<\/p>' +
            '<p class="notify-detail">40pt - ボスを倒せ!<\/p>' +
            '<\/div>' +
            '<\/div>'
        },
        closable: false,
        fadeOut: { enabled: true, delay: 2000 },
        type: 'blackgloss'
    }).show();
}
