import _ from "lodash";

const metodos = {
  validarToken: token => {
    const url = window.Config.WS_VV + "/v1/Usuario/ValidarToken?token=" + token;
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
          if (data.ok != true) {
            debugger;
            reject(data.error);
            return;
          }

          resolve(data.return);
        })
        .catch(error => {
          debugger;
          reject("Error procesando la solicitud");
        });
    });
  },
  datos: token => {
    const url = window.Config.WS_VV + "/v1/Usuario?token=" + token;
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
          if (data.ok != true) {
            reject(data.error);
            return;
          }

          resolve(data.return);
        })
        .catch(error => {
          reject("Error procesando la solicitud");
        });
    });
  }
};

export default metodos;
