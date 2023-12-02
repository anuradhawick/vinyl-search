import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecordsManagementRoutingModule } from './records-management-routing.module';
import { RecordsHomePageComponent } from './records-home-page/records-home-page.component';
import { RecordsEditPageComponent } from './records-edit-page/records-edit-page.component';
import { RecordViewPageComponent } from './record-view-page/record-view-page.component';
import { RecordsEditorComponentComponent } from './records-editor-component/records-editor-component.component';
import { RecordsUpdatePageComponent } from './records-update-page/records-update-page.component';
import { RecordsRevisionViewPageComponent } from './records-revision-view-page/records-revision-view-page.component';
import { FormsModule } from '@angular/forms';
import { SharedModules } from '../shared-modules/shared.module';
import { CatalogErrorModalComponent } from './modals/catalog-error/catalog-error.component';
import { RecordsService } from './services/records.service';
import { ChooseFilterComponent } from './modals/choose-filter/choose-filter.component';

@NgModule({
  declarations: [
    RecordsHomePageComponent,
    RecordsHomePageComponent,
    RecordsEditPageComponent,
    RecordViewPageComponent,
    RecordsEditorComponentComponent,
    RecordsUpdatePageComponent,
    RecordsRevisionViewPageComponent,
    CatalogErrorModalComponent,
    ChooseFilterComponent,
  ],
  imports: [
    CommonModule,
    RecordsManagementRoutingModule,
    FormsModule,
    SharedModules,
  ],
  providers: [RecordsService],
})
export class RecordsManagementModule {}
