sap.ui.jsview("hanadd.view.App", {

	getControllerName: function () {
		return "hanadd.view.App";
	},
	
	createContent: function (oController) {
		
		// to avoid scroll bars on desktop the root view must be set to block display
		this.setDisplayBlock(true);
		
		// create app
		this.app = new sap.m.App();
		
		// load the master page
		/*var dashboard = sap.ui.xmlview("Dashboard", "hanadd.view.Dashboard");
		dashboard.getController().nav = this.getController();
		this.app.addPage(dashboard, true);*/

		var main = sap.ui.xmlview("Main", "hanadd.view.Main");
		main.getController().nav = this.getController();
		this.app.addPage(main, true);

		/*var summary = sap.ui.xmlview("Summary", "hanadd.view.Summary");
		summary.getController().nav = this.getController();
		this.app.addPage(summary, false);

		var memory = sap.ui.xmlview("Memory", "hanadd.view.Memory");
		memory.getController().nav = this.getController();
		this.app.addPage(memory, false);*/

		// done
		return this.app;
	}
});