/**
 * Copyright 2013,2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var FEATURE_RESPONSES = {
  faces: 'imageFaces',
  imageLink: "image",
  imageKeywords: "FILL ME IN"
};

module.exports = function (RED) {
  var cfenv = require('cfenv'),
    AlchemyAPI = require('alchemy-api');

  //TODO: Can I find the service using regex?
  var service = cfenv.getAppEnv().getService('AlchemyAPI');

  RED.httpAdmin.get('/alchemy-image-analysis/vcap', function (req, res) {
    res.json(service);
  });

  function AlchemyImageAnalysisNode (config) {
    RED.nodes.createNode(this, config);
    var node = this;

    if (!service) {
      node.error('No Alchemy API service bound');
      return;
    } 
    
    var alchemy = new AlchemyAPI(service.credentials.apikey);

    this.on('input', function (msg) {
      if (!msg.payload) {
        node.error('Missing property: msg.payload');
        return;
      }

      var feature = config["image-feature"];

      // Do the request here....
      alchemy[feature](msg.payload, {}, function (err, response) {
        if (err || response.status === "ERROR") { 
          node.error('Alchemy API request error: ',  err || response.statusInfo); 
          return;
        }

        msg.result = response[FEATURE_RESPONSES[feature]];
        node.send(msg)
      })
    });
  }

  RED.nodes.registerType('alchemy-image-analysis', AlchemyImageAnalysisNode);
};
