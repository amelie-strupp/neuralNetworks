import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NetworkComponent } from './components/network/network/network.component';
import { ValueAdjustmentDialogComponent } from './components/network/dialogs/value-adjustment-dialog/value-adjustment-dialog.component';
import { SimpleDialogComponent } from './components/general/simple-dialog/simple-dialog.component';
import { LevelPanelComponent } from './components/network/level-panel/level-panel.component';
import { TopBarComponent } from './components/general/top-bar/top-bar.component';
import { SuccessDialogComponent } from './components/network/dialogs/success-dialog/success-dialog.component';
import { ChallengeDialogComponent } from './components/network/dialogs/challenge-dialog/challenge-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    NetworkComponent,
    ValueAdjustmentDialogComponent,
    SimpleDialogComponent,
    LevelPanelComponent,
    TopBarComponent,
    SuccessDialogComponent,
    ChallengeDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
