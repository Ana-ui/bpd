import ClusterModel from '../../models/ClusterModel.js';

export default class ClusterService {

    ORGANIZATION_PATH = "/organizations";
    CLUSTERS_PATH = "/clusters";

    constructor(DSUStorage) {
        this.DSUStorage = DSUStorage;
    }

    getClustersModel(orgUid, callback) {
        debugger
        let clustersPath = this._getClustersPath(orgUid);
        this.DSUStorage.call('listDSUs', clustersPath, (err, dsuList) => {
            if (err) {
                callback(err, undefined);
                return;
            }
            let clusters = [];
            let getClusterDSUs = (dsuItem) => {
                this.DSUStorage.getItem(clustersPath + '/' + dsuItem.identifier + '/data.json', (err, content) => {
                    if (err) {
                        clusters.slice(0);
                        callback(err, undefined);
                        return;
                    }
                    let textDecoder = new TextDecoder("utf-8");
                    let cluster = JSON.parse(textDecoder.decode(content));
                    clusters.push(cluster);

                    if (dsuList.length === 0) {
                        const model = new ClusterModel()._getWrapperData();
                        model.clusters = clusters;
                        callback(undefined, model);
                        return;
                    }
                    getClusterDSUs(dsuList.shift());
                })
            };


            if (dsuList.length === 0) {
                const model = new ClusterModel()._getWrapperData();
                callback(undefined, model);
                return;
            }
            getClusterDSUs(dsuList.shift());
        })

    }

    getCluster(orgUid, clusterUid, callback) {
        this.DSUStorage.getItem(this._getClusterPath(orgUid, clusterUid), (err, content) => {
            if (err) {
                callback(err, undefined);
                return;
            }
            let textDecoder = new TextDecoder("utf-8");
            let cluster = JSON.parse(textDecoder.decode(content));
            callback(undefined, cluster);
        })
    }

    saveCluster(orgUid, data, callback) {
        this.DSUStorage.call('createSSIAndMount', this._getClustersPath(orgUid), (err, keySSI) => {
            if (err) {
                callback(err, undefined);
                return;
            }
            data.KeySSI = keySSI;
            data.uid = keySSI;
            this.updateCluster(orgUid, data, callback);
        })
    }

    updateCluster(orgUid, data, callback) {
        this.DSUStorage.setObject(this._getClusterPath(orgUid, data.uid), data, (err) => {
            if (err) {
                callback(err, undefined);
                return;
            }
            callback(undefined, data);
        })
    }

    unmountCluster(orgUid, clusterUid, callback) {
        let clusterPath = this.CLUSTERS_PATH + '/' + clusterUid;
        this.DSUStorage.call('clusterUnmount', orgUid, clusterPath, (err, result) => {
            if (err) {
                callback(err, undefined);
                return;
            }
            callback(undefined, result);
        });
    }

    _getClustersPath(organizationSSI) {
        return this.ORGANIZATION_PATH + '/' + organizationSSI + this.CLUSTERS_PATH;
    }

    _getClusterPath(organizationSSI, clusterSSI) {
        return this._getClustersPath(organizationSSI) + '/' + clusterSSI + '/data.json';
    }
}