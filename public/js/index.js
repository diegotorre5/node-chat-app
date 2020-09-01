var socket = io();
socket.on('connect', function() {
  console.log('Connected to the server');
});
socket.on('disconnect', function() {
  console.log('Disconnected from the server');
});

socket.on('newMessage', function(message){
  var formattedTime = moment(messages.createAt).format('h:mm a');
  console.log('New Message', message)
  var li = jQuery('<li></li>');
  li.text(`${message.from} ${formattedTime}: ${message.text}`);
  jQuery('#messages').append(li);
});

socket.on('newLocationMessage', function(message){
  var formattedTime = moment(messages.createAt).format('h:mm a');
  var li = jQuery('<li></li>');
  var a = jQuery('<a>My current location</a>');
  li.text(`${message.from} ${formattedTime}: `);
  a.attr('href', message.url);
  li.append(a);
  jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function(e){
  e.preventDefault();
  console.log('CLick');
  socket.emit('createMessage', {
    from: 'User',
    text: jQuery('[name=message]').val()
  }, function(){
    jQuery('[name=message]').val('')
  });
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function() {
  if(!navigator.geolocation){
    return alert('Geolocation is not supported by your browser');
  }
  locationButton.attr('disabled','disabled').text('Sending Location...');
  navigator.geolocation.getCurrentPosition(function (position) {
    locationButton.removeAttr('disabled').text('Send Location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, function(){
      locationButton.removeAttr('disabled'.text('Send Location'));
      alert('Unable to fetch location.')
    });
  });
});
