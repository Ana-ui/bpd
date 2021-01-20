import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

const initModel = {
    title: 'Add a new organization',
    name: {
        name: 'name',
        required: true,
        placeholder: 'Organization name',
        value: ''
    },
    hosting: {
        placeholder: "Choose a hosting type",
        required: true,
        options: [
            {
                label: 'AWS',
                value: 'aws'
            },
            {
                label: 'Google Cloud',
                value: 'gcloud'
            },
            {
                label: 'Azure',
                value: 'azure'
            }
        ]
    },
    endpoint: {
        name: 'endpoint',
        required: true,
        placeholder: 'Endpoint',
        value: ''
    },
    secretKey: {
        name: 'secretKey',
        required: true,
        placeholder: 'Secret Key',
        value: ''
    },
    kubernetesConfig: [

    ],
    loadWithQR: "Load with QRCode"
}

export default class CreateOrganizationModal extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.setModel(this.getParsedModel(this.model))
        this._createNewKubernetesConfig();
        this._onCreateKubernetesConfig();
        this._onRemoveKubernetesConfig();
        this._onUpdateOrganization();
    }

    getParsedModel(receivedModel) {
        let model = JSON.parse(JSON.stringify(initModel));
        model = {
            ...model,
            title: 'Edit the organization',
            name: {
                ...model.name,
                value: receivedModel.name
            },
            hosting: {
                ...model.hosting,
                value: receivedModel.hosting
            },
            endpoint: {
                ...model.endpoint,
                value: receivedModel.endpoint
            },
            secretKey: {
                ...model.secretKey,
                value: receivedModel.secretKey
            },
            kubernetesConfig: receivedModel.kubernetesConfig || []
        }

        return model;
    }

    _createNewKubernetesConfig() {
        const id = (Date.now() + Math.random()).toString().replace('.', '');
        this.model.kubernetesConfig.push({
            key: {
                placeholder: 'Key',
                name: 'Key'
            },
            value: {
                placeholder: 'Value',
                name: 'Value'
            },
            id: {
                value: id
            }
        });
    }

    _onCreateKubernetesConfig() {
        this.on('org:add-kubernetes-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this._createNewKubernetesConfig();
        });
    }

    _onRemoveKubernetesConfig() {
        this.on('org:remove-kubernetes-config', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            for (let i = 0; i < this.model.kubernetesConfig.length; i++) {
                const cfg = this.model.kubernetesConfig[i];

                if (typeof cfg.id === 'undefined') {
                    continue;
                }

                if (cfg.id.value !== e.data) {
                    continue;
                }

                this.model.kubernetesConfig.splice(i, 1);
            }
        });
    }

    _onUpdateOrganization() {
        this.on('org:update', (event) => {
            let toReturnObject = {
                name: this.model.name.value,
                hosting: this.model.hosting.value,
                endpoint: this.model.endpoint.value,
                secretKey: this.model.secretKey.value,
            }
            if (typeof this.model.uid !== undefined)
            {
                toReturnObject.uid = this.model.uid;
            }
            this._finishProcess(event, toReturnObject)
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
