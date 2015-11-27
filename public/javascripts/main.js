$(document).ready(function(){

  var serverSocket = io();

  $('form').submit(function(){
    serverSocket.emit('sendchat', $('#m').val());
    $('#m').val('');
    return false;
  });

  serverSocket.on('connect', function(){
    serverSocket.emit('adduser', prompt("What's your name?"));
  });

  serverSocket.on('updatechat', function(username, msg){
    $('#messages').append('<li> ' + (new Date).toLocaleTimeString("en-GB") + '<b> ' + username + ':</b> ' + msg + '</li>');
  });

  serverSocket.on('updateusers', function(msg){
    $('#users').empty();
    $.each(msg, function(key, value){
      $('#users').append('<p>' + key + '</p>');
    });
  });
});
