const metodos = {
  get: () => {
    let url = window.Config.WS + "/info/general?conPoligono=true";

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      })
        .then(data => data.json())
        .then(data => {
          if (data.estado != "OK") {
            reject(data.error);
            return;
          }
          resolve(data.info);
        })
        .catch(error => {
          reject("Error procesando la solicitud");
        });
    });
  },
  buscar: busqueda => {
    let url = window.Config.WS + "/info/buscar/" + busqueda;

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      })
        .then(data => data.json())
        .then(data => {
          if (data.estado != "OK") {
            reject(data.error);
            return;
          }
          resolve(data.info);
        })
        .catch(error => {
          reject("Error procesando la solicitud");
        });
    });
  },
  buscarCoordenada: comando => {
    let url = `${window.Config.WS}/info/coordenada?lat=${comando.lat}&lng=${comando.lng}`;

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      })
        .then(data => data.json())
        .then(data => {
          if (data.estado != "OK") {
            reject(data.error);
            return;
          }
          resolve(data.info);
        })
        .catch(error => {
          reject("Error procesando la solicitud");
        });
    });
  }
};

export default metodos;
