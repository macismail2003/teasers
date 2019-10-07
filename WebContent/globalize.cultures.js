<!-- <core:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="cuspiechart.V_PieChart" xmlns:viz="sap.viz.ui5.controls" xmlns:html="http://www.w3.org/1999/xhtml">

  <Page title="Title" showHeader="false" enableScrolling="false">
  <content>
  	<Carousel id="idCarouselTeaser"></Carousel>
  </content>
  </Page>

</core:View> -->

<!-- <core:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="cuspiechart.V_PieChart" xmlns:viz="sap.viz.ui5.controls" xmlns:html="http://www.w3.org/1999/xhtml">

<Page title="Title" showHeader="false" enableScrolling="false">
  <content>
  <FlexBox direction="Row" class="margintop105" justifyContent="SpaceBetween">

  <ComboBox id="idComboRegion" text="/items" selectionChange="onSelect">
	  <items>
	  	<core:Item key="{key}" text="{text}"/>
	  </items>
  </ComboBox>

  <Button sap-icon://sys-help text="Full Dashboard" type="Unstyled" class="submitBtn" press="opendash"></Button>

  </FlexBox>
  <ScrollContainer focusable="true" height="100%" horizontal="false" vertical="false" width="100%">
  <viz:Popover id="idPopOver"></viz:Popover>
  <viz:VizFrame height="300px" id="idVizFramePie" uiConfig="{applicationSet:'fiori'}" vizType="pie" legendVisible="true" width="100%"></viz:VizFrame>
  </ScrollContainer>
  </content>
  </Page>
</core:View>	-->

<core:View xmlns:core="sap.ui.core" 
	xmlns:mvc="sap.ui.core.mvc" 
	xmlns="sap.m" controllerName="cuspiechart.V_PieChart" 
	xmlns:viz="sap.viz.ui5.controls" 
	xmlns:html="http://www.w3.org/1999/xhtml">

	<Page title="Title" showHeader="false" enableScrolling="false">
		<content>
			<Carousel id="idCarouselTeaser" loop="true" pageChanged="pageChanged">
				<pages>

					<!-- Customer Dashboard  -->

					<FlexBox direction="Column">
						<FlexBox direction="Row" class="margintop105" justifyContent="SpaceBetween">

							<ComboBox id="idComboRegion" text="/items" selectionChange="onSelect">
								<items>
									<core:Item key="{key}" text="{text}"/>
								</items>
							</ComboBox>
							<FlexBox direction="Row" class="margintop105">
								<Button id="idButtonCusDescription" icon="images/help_w.png" type="Unstyled" class="submitBtn" press="openCustDesc"></Button>
								<Label width="15px"></Label>
								<Button text="Cust. Dashboard" type="Unstyled" class="submitBtn" press="opendash"></Button>
							</FlexBox>
						</FlexBox>
						<viz:VizFrame id="idVizFrameCus" height = "400px" uiConfig="{applicationSet:'fiori'}" vizType="pie" legendVisible="true" width="100%"></viz:VizFrame>
					</FlexBox>


					<!-- Sales Dashboard  -->

					<FlexBox direction="Column">
						<FlexBox direction="Row" class="margintop105" justifyContent="SpaceBetween">

							<Label text=""></Label>

							<Button text="Sales Dashboard" type="Unstyled" class="submitBtn" press="opensale"></Button>

						</FlexBox>
						<viz:VizFrame height="400px" id="idVizFrameSale" uiConfig="{applicationSet:'fiori'}" vizType="stacked_column" legendVisible="true" width="100%"></viz:VizFrame>
					</FlexBox>

					<!-- Today's UTE  -->

					<FlexBox direction="Column">
						<FlexBox direction="Row" class="margintop105" justifyContent="SpaceBetween">

							<Label text=""></Label>

							<Button text="Product Dashboard" type="Unstyled" class="submitBtn" press="openproducts"></Button>

						</FlexBox>
						<FlexBox direction="Column" class="margintop105" alignItems="Center">

							<Label class="todaysutelabel" text="Today's UTE"></Label>

							<Label class="todaysutevalue" id="idTextValueTodayUTE" text=""></Label>

						</FlexBox>
					</FlexBox>

					<!-- IT Dashboard -->

					<FlexBox direction="Column">
						<FlexBox direction="Row" class="margintop105" justifyContent="SpaceBetween">

							<Label text=""></Label>

							<Button text="IT Dashboard" type="Unstyled" class="submitBtn" press="openit"></Button>

						</FlexBox>
						<viz:VizFrame height="400px" id="idVizFrameIT" uiConfig="{applicationSet:'fiori'}" vizType="line" legendVisible="true" width="100%"></viz:VizFrame>
					</FlexBox>


				<!-- IT Availability Dashboard -->

					<FlexBox direction="Column">
						<FlexBox direction="Row" class="margintop105" justifyContent="SpaceBetween">

							<Label text=""></Label>

							<Button visible="false" text="IT Availability" type="Unstyled" class="submitBtn" press="openitavlb"></Button>

						</FlexBox>
						<viz:VizFrame height="400px" id="idVizFrameITAVLB" uiConfig="{applicationSet:'fiori'}" vizType="combination" legendVisible="true" width="100%"></viz:VizFrame>
					</FlexBox>


				</pages>
			</Carousel>
		</content>
	</Page>

</core:View>
