class DOMHelper {
  static clearEventListeners(element) {
    const clonedElement = element.cloneNode(true);
    element.replaceWith(clonedElement);
    return clonedElement;
  }

  static moveElemenet(elemenetId, newDestinationSelector) {
    const element = document.getElementById(elemenetId);
    const destinaionElement = document.querySelector(newDestinationSelector);
    destinaionElement.append(element);
  }
}

class Component {}
class ToolTip {
  constructor(closeNotifierFunction) {
    this.closeNotifier = closeNotifierFunction;
  }

  closeToolTip = () => {
    this.detach();
    this.closeNotifier();
  };

  detach() {
    this.element.remove();
    // this.element.parentElement.removeChild(this.element);  //for older browser
  }

  attach() {
    const toolTipElement = document.createElement("div");
    toolTipElement.className = "card";
    toolTipElement.textContent = "dummy";
    toolTipElement.addEventListener("click", this.closeToolTip);
    this.element = toolTipElement;
    document.body.append(toolTipElement);
  }
}

class ProjectItem {
  hasActiveToolTip = false;

  constructor(id, updateProjectListsFunction, type) {
    this.updateProjectListsHandler = updateProjectListsFunction;
    this.id = id;
    this.connectMoreInfoButton();
    this.connectSwitchButton(type);
  }

  showMoreInfoHandler() {
    if (this.hasActiveToolTip) {
      return;
    }
    const toolTip = new ToolTip(() => {
      this.hasActiveToolTip = false;
    });
    toolTip.attach();
    this.hasActiveToolTip = true;
  }

  connectMoreInfoButton() {
    const projectItemElement = document.getElementById(this.id);
    const moreInfoBtn = projectItemElement.querySelector(
      "button:first-of-type"
    );
    moreInfoBtn.addEventListener("click", this.showMoreInfoHandler);
  }

  connectSwitchButton(type) {
    const projectItemElement = document.getElementById(this.id);
    let swithcButton = projectItemElement.lastElementChild;
    swithcButton = DOMHelper.clearEventListeners(swithcButton);
    swithcButton.textContent = type === "active" ? "Finish" : "Activate";
    swithcButton.addEventListener(
      "click",
      this.updateProjectListsHandler.bind(null, this.id)
    );
  }

  update(updateProjectListsFn, type) {
    this.updateProjectListsHandler = updateProjectListsFn;
    this.connectSwitchButton(type);
  }
}

class ProjectList {
  projects = [];

  constructor(type) {
    this.type = type;
    const prjItems = document.querySelectorAll(`#${type}-projects li`);
    for (const prjItem of prjItems) {
      this.projects.push(
        new ProjectItem(prjItem.id, this.switchProject.bind(this), this.type)
      );
    }
    console.log(this.projects);
  }

  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }

  addProject(project) {
    this.projects.push(project);
    DOMHelper.moveElemenet(project.id, `#${this.type}-projects ul`);
    project.update(this.switchProject.bind(this), this.type);
  }

  switchProject(projectId) {
    // const projectIndex = this.projects.findIndex((p) => p.id === projectId);
    // this.projects.splice(projectIndex,1);
    this.switchHandler(this.projects.find((p) => p.id === projectId));
    this.projects = this.projects.filter((p) => p.id !== projectId);
  }
}

class App {
  static init() {
    const activeProjectList = new ProjectList("active");
    const finishedProjectList = new ProjectList("finished");
    activeProjectList.setSwitchHandlerFunction(
      finishedProjectList.addProject.bind(finishedProjectList)
    );
    finishedProjectList.setSwitchHandlerFunction(
      activeProjectList.addProject.bind(activeProjectList)
    );
  }
}

App.init();
