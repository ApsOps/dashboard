// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {StateParams} from 'logs/logs_state';
import {stateName as logsStateName} from 'logs/logs_state';

/**
 * Controller for the logs menu view.
 *
 * @final
 */
export class PodLogsMenuController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @ngInject
   */
  constructor($state, $log, $resource) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /**
     * This is initialized from the scope.
     * @export {string}
     */
    this.replicationControllerName;

    /**
     * This is initialized from the scope.
     * @export {string}
     */
    this.namespace;

    /**
     * This is initialized on open menu.
     * @export {!Array<!backendApi.ReplicationControllerPodWithContainers>}
     */
    this.replicationControllerPodsList;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * Opens menu with pods and link to logs.
   * @param  {!function(!MouseEvent)} $mdOpenMenu
   * @param  {!MouseEvent} $event
   * @export
   */
  openMenu($mdOpenMenu, $event) {
    // This is needed to resolve problem with data refresh.
    // Sometimes old data was included to the new one for a while.
    if (this.replicationControllerPodsList) {
      this.replicationControllerPodsList = [];
    }
    this.getReplicationControllerPods_();
    $mdOpenMenu($event);
  }

  /**
   * @private
   */
  getReplicationControllerPods_() {
    /** @type {!angular.Resource<!backendApi.ReplicationControllerPods>} */
    let resource = this.resource_(
        `api/v1/replicationcontroller/pod/${this.namespace}/` +
        `${this.replicationControllerName}?limit=10`);

    resource.get(
        (replicationControllerPods) => {
          this.log_.info(
              'Successfully fetched Replication Controller pods: ', replicationControllerPods);
          this.replicationControllerPodsList = replicationControllerPods.pods;
        },
        (err) => { this.log_.error('Error fetching Replication Controller pods: ', err); });
  }

  /**
   * @param {string} podName
   * @return {string}
   * @export
   */
  getLogsHref(podName) {
    return this.state_.href(
        logsStateName, new StateParams(this.namespace, this.replicationControllerName, podName));
  }

  /**
   * Checks if pod contains at least one container. Return true if yes, otherwise false.
   * @param {!backendApi.ReplicationControllerPodWithContainers} pod
   * @return {boolean}
   * @export
   */
  podContainerExists(pod) {
    if (pod.podContainers[0].name === undefined) {
      return false;
    }
    return true;
  }

  /**
   * Checks if pod containers were restarted. Return true if yes, otherwise false.
   * @param {backendApi.ReplicationControllerPodWithContainers} pod
   * @return {boolean}
   * @export
   */
  podContainersRestarted(pod) {
    if (pod) {
      return pod.totalRestartCount > 0;
    }
    return false;
  }
}

/**
 * Returns directive definition object for logs menu.
 * @return {!angular.Directive}
 */
export const podLogsMenuComponent = {
  bindings: {
    'namespace': '=',
    'replicationControllerName': '=',
  },
  controller: PodLogsMenuController,
  templateUrl: 'replicationcontrollerlist/podlogsmenu.html',
};

const i18n = {
  /** @export {string} @desc Tooltip 'Logs' on the logs button on a replication controller card */
  MSG_RC_LIST_LOGS_TOOLTIP: goog.getMsg('Logs'),
  /** @export {string} @desc Label 'Logs' at the top of the drop down menu when a user clicks the logs button on
      a replication controller card. */
  MSG_RC_LIST_LOGS_LABEL: goog.getMsg('Logs'),
  /** @export {string} @desc Label 'Pod' for the column with pods in the logs drop down view
      (opened from a replication controller card). */
  MSG_RC_LIST_LOGS_POD_LABEL: goog.getMsg('Pod'),
  /** @export {string} @desc Label 'Running since' for the respective column in the logs drop down view
      (opened from a replication controller card). */
  MSG_RC_LIST_LOGS_RUNNING_SINCE_LABEL: goog.getMsg('Running since'),
  /** @export {string} @desc Label 'Not running' which appears in the pod logs list (opened from a
      replication controller card) when there are no logs for a given pod. */
  MSG_RC_LIST_LOGS_NOT_RUNNING_LABEL: goog.getMsg('Not running'),
};
