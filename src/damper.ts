/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The Damper class is a generic second-order critically damped system that does
 * one linear step of the desired length of time. The only parameter is
 * DECAY_MILLISECONDS. This common parameter makes all states converge at the
 * same rate regardless of scale. xNormalization is a number to provide the
 * rough scale of x, such that NIL_SPEED clamping also happens at roughly the
 * same convergence for all states.
 *
 * Taken from Google model-viewer.
 *
 * https://github.com/google/model-viewer/blob/ec527bc1d0e1bcb4421fa192a7e62bbc5764db91/packages/model-viewer/src/three-components/Damper.ts#L1
 */
export class Damper {
    static readonly SETTLING_TIME = 10000;  // plenty long enough
    static readonly MIN_DECAY_MILLISECONDS = 0.001;
    static readonly DECAY_MILLISECONDS = 50;

    private velocity: number = 0;
    private naturalFrequency: number = 0;

    constructor(decayMilliseconds: number = Damper.DECAY_MILLISECONDS) {
        this.setDecayTime(decayMilliseconds);
    }

    setDecayTime(decayMilliseconds: number) {
        this.naturalFrequency =
            1 / Math.max(Damper.MIN_DECAY_MILLISECONDS, decayMilliseconds);
    }

    update(
        v: number,
        vGoal: number,
        timeStepMilliseconds: number,
        xNormalization: number,
    ): number {
        const nilSpeed = 0.0002 * this.naturalFrequency;

        if (v == null || xNormalization === 0) {
            return vGoal;
        }
        if (v === vGoal && this.velocity === 0) {
            return vGoal;
        }
        if (timeStepMilliseconds < 0) {
            return v;
        }
        // Exact solution to a critically damped second-order system, where:
        // acceleration = this.naturalFrequency * this.naturalFrequency * (vGoal
        // - v) - 2 * this.naturalFrequency * this.velocity;
        const deltaV = (v - vGoal);
        const intermediateVelocity = this.velocity + this.naturalFrequency * deltaV;
        const intermediateX = deltaV + timeStepMilliseconds * intermediateVelocity;
        const decay = Math.exp(-this.naturalFrequency * timeStepMilliseconds);
        const newVelocity =
            (intermediateVelocity - this.naturalFrequency * intermediateX) * decay;
        const acceleration =
            -this.naturalFrequency * (newVelocity + intermediateVelocity * decay);
        if (Math.abs(newVelocity) < nilSpeed * Math.abs(xNormalization) &&
            acceleration * deltaV >= 0) {
            // This ensures the controls settle and stop calling this function instead
            // of asymptotically approaching their goal.
            this.velocity = 0;
            return vGoal;
        } else {
            this.velocity = newVelocity;
            return vGoal + intermediateX * decay;
        }
    }
}
