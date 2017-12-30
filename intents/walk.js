const walk = scure => (app) => {
  const changeRoom = (roomId) => {
    const newApp = app;
    newApp.data.roomId = roomId;
    return newApp;
  };

  const arg = app.getArgument('arg');
  if (!arg) {
    const destinations = scure.getDestinationNamesFrom(app.data.roomId);
    app.ask(`Desde aquí puedo ir a: ${destinations}`);
    return;
  }
  const newRoom = scure.getRoomByName(arg);
  const isAllowed = scure.isAllowedDestination(arg, app.data.roomId);
  if (!newRoom || !isAllowed) {
    const destinations = scure.getDestinationNamesFrom(app.data.roomId);
    app.ask(`No sé ir al sitio ${arg}. Desde aquí puedo ir a: ${destinations}`);
    return;
  }
  changeRoom(newRoom.id);
  app.ask(newRoom.description);
};

exports.walk = walk;