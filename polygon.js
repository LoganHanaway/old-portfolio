; (function ($) {

    class Polygon {

        constructor($this, options) {

            this.$this = $this;
            this.settings = $.extend({}, $.fn.polygon.defaults, options);

            this.canvasElement = document.createElement('canvas');
            this.$this.append(this.canvasElement);

            this.ctx = this.canvasElement.getContext('2d');

            this.m_nodeMovementDistance = this.settings.nodeMovementDistance;

            const Constants = {
                Animation: {
                    EASING_LINEAR: "linear",
                    EASING_EASEIN: "easeIn",
                    EASING_EASEOUT: "easeOut",
                    EASING_EASEINOUT: "easeInOut",
                    EASING_ACCELERATE: "accelerateDecelerate",
                    EASING_DESCENDING: "descendingEntrance"
                },
                Rotation: {
                    MEDIAN_AXIS: "median",
                    CENTER_AXIS: "center",
                    LEFT_AXIS: "left",
                    RIGHT_AXIS: "right"
                },
                Coloring: {
                    COLORING_LINEAR: "linear",
                    COLORING_RANDOM: "random"
                }
            };


            this.setupClusterNodes = function () {
                this.nodes = [];

                for (let i = 0; i < this.settings.numberOfNodes + this.settings.numberOfUnconnectedNode; i++) {
                    let currentNode = { x: 0, y: 0, z: 0 };

                    if (this.settings.randomizePolygonMeshNetworkFormation) {
                        currentNode.x = Math.random() * this.settings.canvasWidth;
                        currentNode.y = Math.random() * this.settings.canvasHeight;
                    }
                    else {
                        currentNode = this.settings.specifyPolygonMeshNetworkFormation(i);
                    }

                    let phi = Math.acos((Math.random() * 2) - 1);
                    currentNode.z = this.settings.node3dDepthDistance + (this.settings.node3dDepthDistance * Math.cos(phi));

                    this.settings.nodeDotColor = Array.isArray(this.settings.nodeDotColor) ? this.settings.nodeDotColor : new Array(this.settings.nodeDotColor);
                    this.settings.nodeLineColor = Array.isArray(this.settings.nodeLineColor) ? this.settings.nodeLineColor : new Array(this.settings.nodeLineColor);
                    this.settings.nodeFillColor = Array.isArray(this.settings.nodeFillColor) ? this.settings.nodeFillColor : new Array(this.settings.nodeFillColor);
                    this.settings.nodeFillGradientColor = Array.isArray(this.settings.nodeFillGradientColor) ? this.settings.nodeFillGradientColor : new Array(this.settings.nodeFillGradientColor);

                    if (this.settings.nodeOverflow == false) {
                        let maxDistance = this.settings.nodeMovementDistance + this.settings.nodeDotSize;
                        let maxHeight = this.settings.canvasHeight - maxDistance;
                        let maxWidth = this.settings.canvasWidth - maxDistance;

                        this.m_nodeMovementDistance = Math.min(Math.min(this.settings.nodeMovementDistance, maxWidth), Math.min(this.settings.nodeMovementDistance, maxHeight));

                        currentNode.x = Math.floor(currentNode.x + maxDistance > this.settings.canvasWidth ? maxWidth : currentNode.x);
                        currentNode.x = Math.floor(currentNode.x - maxDistance < maxDistance ? maxDistance : currentNode.x);
                        currentNode.y = Math.floor(currentNode.y + maxDistance > this.settings.canvasHeight ? maxHeight : currentNode.y);
                        currentNode.y = Math.floor(currentNode.y - maxDistance < maxDistance ? maxDistance : currentNode.y);
                    }

                    this.nodes.push({
                        currentX: currentNode.x,
                        originX: currentNode.x,
                        startX: currentNode.x,
                        targetX: currentNode.x,
                        currentY: currentNode.y,
                        originY: currentNode.y,
                        startY: currentNode.x,
                        targetY: currentNode.y,
                        originZ: currentNode.z,
                        zAlpha: 1
                    });

                    this.nodes[i].UnconnectedNode = (this.settings.numberOfUnconnectedNode > i);
                }

                for (let i = 0; i < this.nodes.length; i++) {
                    let node = this.nodes[i];
                    let closestNodes = this.nodes;

                    closestNodes = closestNodes.filter(function (item) {
                        return item !== node;
                    });

                    closestNodes.sort(function (a, b) {
                        if (getDistance(node, a) > getDistance(node, b)) return 1;
                        if (getDistance(node, a) < getDistance(node, b)) return -1;
                        return 0;
                    });

                    closestNodes = closestNodes.splice(0, this.settings.nodeRelations);

                    node.Closest = closestNodes;

                    node.nodeDotColor = this.settings.nodeDotColor[this.settings.nodeDotColoringSchema == Constants.Coloring.COLORING_RANDOM ?
                        Math.floor(Math.random() * this.settings.nodeDotColor.length) :
                        i % this.settings.nodeDotColor.length];
                    node.nodeLineColor = this.settings.nodeLineColor[this.settings.nodeLineColoringSchema == Constants.Coloring.COLORING_RANDOM ?
                        Math.floor(Math.random() * this.settings.nodeLineColor.length) :
                        i % this.settings.nodeLineColor.length];
                    node.nodeFillColor = this.settings.nodeFillColor[this.settings.nodeFillColoringSchema == Constants.Coloring.COLORING_RANDOM ?
                        Math.floor(Math.random() * this.settings.nodeFillColor.length) :
                        i % this.settings.nodeFillColor.length];
                    node.nodeFillGradientColor = this.settings.nodeFillGradientColor[this.settings.nodeFillGradientColoringSchema == Constants.Coloring.COLORING_RANDOM ?
                        Math.floor(Math.random() * this.settings.nodeFillGradientColor.length) :
                        i % this.settings.nodeFillGradientColor.length];

                    this.setAlphaLevel(node);
                }
            };

            this.Animator = function ($self, easing, fps, duration, delay, fancyEntrance, callback) {

                function step(timestamp) {
                    if (!m_startTime)
                        m_startTime = timestamp;
                    if (!m_lastFrameUpdate)
                        m_lastFrameUpdate = timestamp;
                    let currentFrame = Math.floor((timestamp - m_startTime) / (1000 / fps));

                    if (m_frameCount < currentFrame) {
                        m_frameCount = currentFrame;
                        let currentDuration = timestamp - m_lastFrameUpdate;
                        if (currentDuration <= m_duration) {
                            if (m_newTargetPossition) {
                                setNewTargetPossition();
                                m_newTargetPossition = false;
                            }
                            if (m_entranceSingleton && fancyEntrance) {
                                setNewNodePossition(Constants.Animation.EASING_DESCENDING, currentDuration, m_duration);
                            }
                            else {
                                setNewNodePossition(easing, currentDuration, m_duration);
                            }

                            if (callback && typeof (callback) === "function") {
                                callback($self);
                            }
                        }
                        else if (currentDuration >= (m_duration + m_delay)) {
                            m_lastFrameUpdate = timestamp;
                            m_newTargetPossition = true;
                            m_entranceSingleton = false;
                        }
                    }
                    m_requestId = m_requestAnimationFrame(step);
                }

                this.isRunning = false;

                this.start = function () {
                    if (!this.isRunning) {
                        this.isRunning = true;
                        m_duration = duration * 1000;
                        m_delay = delay * 1000;
                        m_requestId = m_requestAnimationFrame(step);
                    }
                };

                this.stop = function () {
                    if (this.isRunning) {
                        m_cancleAnimationFrame(m_requestId);
                        this.isRunning = false;
                        m_startTime = null;
                        m_frameCount = -1;
                    }
                };

                function setNewTargetPossition() {
                    let allNewTargetX = [];

                    for (let i in $self.nodes) {
                        let newTargetX = $self.calculateNewTargetPossition($self.nodes[i].originX);
                        let newTargetY = $self.calculateNewTargetPossition($self.nodes[i].originY);

                        $self.nodes[i].targetX = newTargetX;
                        $self.nodes[i].targetY = newTargetY;
                        $self.nodes[i].startX = $self.nodes[i].currentX;
                        $self.nodes[i].startY = $self.nodes[i].currentY;

                        $self.nodes[i].NodePrediction = $self.settings.nodeDotPrediction > 0 && Math.random() <= $self.settings.nodeDotPrediction;

                        allNewTargetX.push($self.nodes[i].targetX);
                    }

                    if ($self.settings.node3dRotateAxis == Constants.Rotation.MEDIAN_AXIS) {
                        allNewTargetX.sort(function (a, b) { return a - b; });

                        var half = Math.floor(allNewTargetX.length / 2);

                        if (allNewTargetX.length % 2) {
                            m_rotationAxis = allNewTargetX[half];
                        } else {
                            m_rotationAxis = Math.floor((allNewTargetX[half - 1] + allNewTargetX[half]) / 2.0);
                        }
                    } else if ($self.settings.node3dRotateAxis == Constants.Rotation.LEFT_AXIS) {
                        m_rotationAxis = 0;
                    } else if ($self.settings.node3dRotateAxis == Constants.Rotation.RIGHT_AXIS) {
                        m_rotationAxis = $self.settings.canvasWidth;
                    } else {
                        m_rotationAxis = $self.settings.canvasWidth / 2;
                    }

                    m_3dRotateOnNthNodeMovement++;
                }

                function setNewNodePossition(easing, currentTime, endTime) {
                    m_turnSpeed = 2 * Math.PI / ($self.settings.duration * $self.settings.animationFps);
                    m_turnAngle = (m_turnAngle + m_turnSpeed) % (2 * Math.PI);
                    m_sinAngle = Math.sin(getEasing($self.settings.node3dRotatEase, currentTime, m_turnSpeed, 2 * Math.PI, endTime));
                    m_cosAngle = Math.cos(getEasing($self.settings.node3dRotatEase, currentTime, m_turnSpeed, 2 * Math.PI, endTime));

                    for (let i in $self.nodes) {
                        $self.nodes[i].currentX = getEasing(easing, currentTime, $self.nodes[i].startX, $self.nodes[i].targetX, endTime);
                        $self.nodes[i].currentY = getEasing(easing, currentTime, $self.nodes[i].startY, $self.nodes[i].targetY, endTime);

                        if ($self.settings.node3dRotate && (m_3dRotateOnNthNodeMovement % $self.settings.node3dRotateOnNthNodeMovement) == 0) {
                            let m_dist = m_rotationAxis - $self.nodes[i].currentX;
                            m_rotX = -m_cosAngle * m_dist + m_sinAngle * ($self.nodes[i].originZ - $self.settings.node3dDepthDistance);
                            m_rotZ = -m_sinAngle * m_dist + m_cosAngle * ($self.nodes[i].originZ - $self.settings.node3dDepthDistance);
                            $self.nodes[i].currentX = m_rotX + m_rotationAxis;

                            if ($self.settings.nodeOverflow == false) {
                                let maxHeight = $self.settings.canvasHeight - $self.settings.nodeDotSize;
                                let maxWidth = $self.settings.canvasWidth - $self.settings.nodeDotSize;

                                $self.nodes[i].currentX = Math.floor($self.nodes[i].currentX > maxWidth ? maxWidth : $self.nodes[i].currentX);
                                $self.nodes[i].currentX = Math.floor($self.nodes[i].currentX < $self.settings.nodeDotSize ? $self.settings.nodeDotSize : $self.nodes[i].currentX);
                                $self.nodes[i].currentY = Math.floor($self.nodes[i].currentY > $self.settings.canvasHeight ? maxHeight : $self.nodes[i].currentY);
                                $self.nodes[i].currentY = Math.floor($self.nodes[i].currentY < $self.settings.nodeDotSize ? $self.settings.nodeDotSize : $self.nodes[i].currentY);
                            }

                            $self.nodes[i].zAlpha = (1 - m_rotZ / (m_rotationAxis / 2));
                            let minAlpha = $self.settings.node3dRotateDepthAlpha;
                            $self.nodes[i].zAlpha = ($self.nodes[i].zAlpha > 1) ? 1 : (($self.nodes[i].zAlpha < minAlpha) ? minAlpha : $self.nodes[i].zAlpha);

                            m_3dRotateOnNthNodeMovement = 0;
                        }

                    }
                }

                let m_requestAnimationFrame = window.requestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame;
                let m_cancleAnimationFrame = window.cancelAnimationFrame ||
                    window.mozCancelRequestAnimationFrame ||
                    window.webkitCancelRequestAnimationFrame ||
                    window.oCancelRequestAnimationFrame ||
                    window.msCancelRequestAnimationFrame;

                let m_startTime = null;
                let m_frameCount = -1;
                let m_requestId = null;
                let m_lastFrameUpdate = null;
                let m_newTargetPossition = true;
                let m_entranceSingleton = true;
                let m_duration;
                let m_delay;
                let m_sinAngle;
                let m_cosAngle;
                let m_turnAngle = 0;
                let m_turnSpeed = 2 * Math.PI / (100);
                let m_rotZ;
                let m_rotX;
                let m_rotationAxis = 0;
                let m_3dRotateOnNthNodeMovement = 0;
            };

            function getEasing(easing, currentTime, startPossition, targetPossition, endTime) {
                switch (easing) {
                    case Constants.Animation.EASING_LINEAR:
                        return (targetPossition - startPossition) * (currentTime / endTime) + startPossition;
                    case Constants.Animation.EASING_EASEIN:
                        currentTime /= endTime;
                        return (targetPossition - startPossition) * Math.pow(currentTime, 2) + startPossition;
                    case Constants.Animation.EASING_EASEOUT:
                        currentTime /= endTime;
                        return -(targetPossition - startPossition) * currentTime * (currentTime - 2) + startPossition;
                    case Constants.Animation.EASING_EASEINOUT:
                        currentTime /= (endTime / 2);
                        if (currentTime < 1)
                            return (targetPossition - startPossition) / 2 * Math.pow(currentTime, 2) + startPossition;
                        return -(targetPossition - startPossition) / 2 * ((currentTime - 1) * ((currentTime - 1) - 2) - 1) + startPossition;
                    case Constants.Animation.EASING_ACCELERATE:
                        currentTime /= (endTime / 2);
                        if (currentTime < 1)
                            return (targetPossition - startPossition) / 2 * Math.pow(currentTime, 3) + startPossition;
                        return (targetPossition - startPossition) / 2 * (Math.pow(currentTime - 2, 3) + 2) + startPossition;
                    case Constants.Animation.EASING_DESCENDING:
                        currentTime /= (endTime / 2);
                        if (currentTime < 1)
                            return (targetPossition - startPossition) / Math.pow(currentTime, 3) + startPossition;
                        return (targetPossition - startPossition) / (Math.pow(currentTime - 2, 3) + 2) + startPossition;
                    default:
                        return getEasing(Constants.Animation.EASING_LINEAR, currentTime, startPossition, targetPossition, endTime);
                }
            }

            this.calculateNewTargetPossition = function (originValue) {
                return originValue + (Math.random() < 0.5 ? -Math.random() : Math.random()) * this.m_nodeMovementDistance;
            };

            this.setAlphaLevel = function (node) {
                let screenDistance = Math.sqrt(Math.pow(this.settings.canvasWidth, 2) + Math.pow(this.settings.canvasHeight, 2));
                let nodeDistance = 0;
                for (let i in node.Closest) {
                    nodeDistance += getDistance(node.Closest[i], node.Closest[(i + 1) % node.Closest.length]);
                }
                let generalAlpha = 1 - (nodeDistance / screenDistance);
                node.lineAlpha = generalAlpha * this.settings.nodeLineAlpha;
                node.dotAlpha = generalAlpha * this.settings.nodeDotAlpha;

                if (generalAlpha > 0.85) {
                    node.fillAlpha = generalAlpha * this.settings.nodeFillAlpha;
                    node.lineAlpha = this.settings.nodeLineAlpha;
                    node.dotAlpha = this.settings.nodeDotAlpha;
                }
                else if (generalAlpha < 0.8 && generalAlpha > 0.7) {
                    node.fillAlpha = 0.5 * generalAlpha * this.settings.nodeFillAlpha;
                    node.lineAlpha = this.settings.nodeLineAlpha;
                    node.dotAlpha = this.settings.nodeDotAlpha;
                }
                else if (generalAlpha < 0.7 && generalAlpha > 0.4) {
                    node.fillAlpha = 0.2 * generalAlpha * this.settings.nodeFillAlpha;
                }
                else {
                    node.fillAlpha = 0;
                }
            };

            this.draw = function ($self) {
                $self.ctx.clearRect(0, 0, $self.settings.canvasWidth, $self.settings.canvasHeight);
                for (let i in $self.nodes) {
                    // Draw the lines and circles.
                    $self.drawLines($self, $self.nodes[i]);
                    $self.drawCircle($self, $self.nodes[i]);
                }
            };


            this.drawLines = function ($self, node) {
                if (!node.lineAlpha > 0 && !node.fillAlpha > 0)
                    return;

                for (let i in node.Closest) {
                    let lineConnection = (node.Closest[i].UnconnectedNode == false && node.Closest[(i + 1) % node.Closest.length].UnconnectedNode == false);
                    let drawCloseUnconnection = $self.settings.ConnectUnconnectedNodes == true && getDistance(node, node.Closest[i]) <= $self.settings.ConnectUnconnectedNodesDistance;

                    if (lineConnection || drawCloseUnconnection) {
                        if (node.lineAlpha > 0) {
                            if (drawCloseUnconnection) {
                                let connectioDist = (1 - (getDistance(node, node.Closest[i]) / $self.settings.ConnectUnconnectedNodesDistance)) * 1.8;
                                connectioDist = connectioDist > 1 ? 1 : connectioDist;
                                $self.drawLineNodeConnection($self, node, i, connectioDist);
                            } else {
                                $self.drawLineNodeConnection($self, node, i, 1);
                            }
                        }

                        if ($self.settings.nodeFillSapce && node.fillAlpha > 0 && lineConnection) {
                            $self.drawFillNodeConnection($self, node, i);
                        }
                    }
                }
            };

            this.drawLineNodeConnection = function ($self, node, i, connectioAlpha) {
                $self.ctx.beginPath();
                $self.ctx.moveTo(node.currentX, node.currentY);
                $self.ctx.lineTo(node.Closest[i].currentX, node.Closest[i].currentY);
                $self.ctx.strokeStyle = 'rgba(' + node.nodeLineColor + ',' + ((node.lineAlpha * node.zAlpha) * connectioAlpha) + ')';
                $self.ctx.stroke();
            };

            this.drawFillNodeConnection = function ($self, node, i) {
                $self.ctx.beginPath();
                $self.ctx.moveTo(node.currentX, node.currentY);
                $self.ctx.lineTo(node.Closest[i].currentX, node.Closest[i].currentY);
                $self.ctx.lineTo(node.Closest[(i + 1) % node.Closest.length].currentX, node.Closest[(i + 1) % node.Closest.length].currentY);

                if (node.nodeFillGradientColor !== null && (isFinite(node.currentX) && isFinite(node.currentY) && isFinite(node.Closest[i].currentX) && isFinite(node.Closest[i].currentY))) {
                    var gradient = $self.ctx.createLinearGradient(node.currentX, node.currentY, node.Closest[i].currentX, node.Closest[i].currentY);
                    gradient.addColorStop(0, 'rgba(' + node.nodeFillColor + ',' + (node.fillAlpha * node.zAlpha) + ')');
                    gradient.addColorStop(1, 'rgba(' + node.nodeFillGradientColor + ', ' + (node.fillAlpha * node.zAlpha) + ')');
                    $self.ctx.fillStyle = gradient;
                }
                else {
                    $self.ctx.fillStyle = 'rgba(' + node.nodeFillColor + ',' + (node.fillAlpha * node.zAlpha) + ')';
                }

                $self.ctx.fill();
            };

            this.drawCircle = function ($self, node) {
                if (!node.dotAlpha > 0)
                    return;

                $self.ctx.beginPath();
                $self.ctx.arc(node.currentX, node.currentY, $self.settings.nodeDotSize, 0, Math.PI * 2, false);
                $self.ctx.fillStyle = 'rgba(' + node.nodeDotColor + ', ' + (node.dotAlpha * node.zAlpha) + ')';

                if ($self.settings.nodeGlowing) {
                    $self.ctx.shadowBlur = 10;
                    $self.ctx.shadowColor = 'rgba(' + node.nodeDotColor + ', ' + (node.dotAlpha * node.zAlpha) + ')';
                } if (node.NodePrediction == true) {
                    let nodeSize = ($self.settings.nodeDotSize * Math.PI);
                    let nodeMiddleSize = (nodeSize / 2);
                    $self.ctx.font = nodeSize + "px Arial";
                    $self.ctx.strokeRect(node.targetX - nodeMiddleSize, node.targetY - nodeMiddleSize, nodeSize, nodeSize);
                    $self.ctx.fillText(node.targetX + ", " + node.targetY, node.targetX + nodeSize, node.targetY - nodeMiddleSize);
                }
                $self.ctx.fill();
            };

            function getDistance(firstNode, secondNode) {
                return Math.sqrt(Math.pow(firstNode.currentX - secondNode.currentX, 2) + Math.pow(firstNode.currentY - secondNode.currentY, 2));
            }
        }

        refresh() {
            this.clear();
            this.canvasElement.width = this.settings.canvasWidth;
            this.canvasElement.height = this.settings.canvasHeight;
            this.canvasElement.style.position = this.settings.canvasPosition;
            this.canvasElement.style.top = this.settings.canvasTop;
            this.canvasElement.style.bottom = this.settings.canvasBottom;
            this.canvasElement.style.right = this.settings.canvasRight;
            this.canvasElement.style.left = this.settings.canvasLeft;
            this.canvasElement.style.zIndex = this.settings.canvasZ;

            this.setupClusterNodes();

            this.animation = new this.Animator(this,
                this.settings.nodeEase,
                this.settings.animationFps,
                this.settings.duration,
                this.settings.restNodeMovements,
                this.settings.nodeFancyEntrance,
                this.draw);

            this.animation.start();
        }

        start() {
            if (this.animation !== undefined) {
                this.animation.start();
            }
        }

        stop() {
            if (this.animation !== undefined) {
                this.animation.stop();
            }
        }

        clear() {
            this.stop();
            if (this.ctx !== undefined)
                this.ctx.clearRect(0, 0, this.settings.canvasWidth, this.settings.canvasHeight);
        }

        options(options) {
            if (this.$this !== undefined) {
                for (let option in options) {
                    this.settings[option] = options[option];
                }
            }
        }

        destroy() {
            if (this.$this !== undefined) {
                this.clear();
                this.$this.removeData("polygon");
                delete this.$this;
            }
        }
    }

    $.fn.polygon = function (option) {
        let options = typeof option == "object" && option;

        return this.each(function () {
            let $this = $(this);
            let $polygon = $this.data("polygon");

            if (!$polygon) {
                $polygon = new Polygon($this, options);
                $this.data("polygon", $polygon);
            } else if (options) {
                $polygon.options(options);
            }

            if (typeof option == 'string') {
                $polygon[option]();
            } else {
                $polygon.refresh();
            }
        });
    };

    $.fn.polygon.defaults = {

        restNodeMovements: 0,
        duration: 10,
        nodeMovementDistance: 200,
        node3dDepthDistance: 500,
        node3dRotate: false,
        node3dRotateOnNthNodeMovement: 1,
        node3dRotateDepthAlpha: 0.1,
        node3dRotatEase: "linear",
        node3dRotateAxis: "center",
        numberOfNodes: 50,
        numberOfUnconnectedNode: 0,
        ConnectUnconnectedNodes: true,
        ConnectUnconnectedNodesDistance: 250,
        nodeDotSize: 3,
        nodeEase: "easeOut",
        nodeFancyEntrance: false,
        randomizePolygonMeshNetworkFormation: true,
        specifyPolygonMeshNetworkFormation: null,
        nodeRelations: 3,
        animationFps: 30,
        nodeDotColor: "60, 101, 250",
        nodeDotColoringSchema: "linear",
        nodeLineColor: "60, 101, 250",
        nodeLineColoringSchema: "linear",
        nodeFillColor: "60, 101, 250",
        nodeFillColoringSchema: "linear",
        nodeFillGradientColor: null,
        nodeFillGradientColoringSchema: "linear",
        nodeFillAlpha: 0.5,
        nodeLineAlpha: 0.5,
        nodeDotAlpha: 1.0,
        nodeDotPrediction: 0,
        nodeFillSapce: true,
        nodeOverflow: true,
        nodeGlowing: false,
        canvasWidth: $(this).width(),
        canvasHeight: $(this).height(),
        canvasPosition: "fixed",
        canvasTop: "auto",
        canvasBottom: "auto",
        canvasRight: "auto",
        canvasLeft: "auto",
        canvasZ: "auto"
    };

}(jQuery));

$('#example').polygon();