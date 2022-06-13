import { People } from '@mui/icons-material';
import { Button, Card, Typography } from '@mui/material';
import React from 'react';

/// The configuration of a grave
export interface GraveConfig {

  /// The owner of the grave.
  owner: string;

  /// The time when the owner born.
  birthday: Date;

  /// The time when the owner died.
  deathday: Date;

  /// Custom message to describe the owner.
  customDescription?: React.ReactNode | string;

  /// The header content, to display a picture or something else.
  customHeader?: React.ReactNode;

  /// If enabled, then the page will automatically be in "commemorate mode" when the Qingming festival comes.
  /// DEFAULT: false
  qingmingModeEnabled?: boolean;

  /// If enabled, then the page will automatically be in "commemorate mode" when the deathday comes.
  /// DEFAULT: true
  deathCommemorateEnabled?: boolean;

  /// Customize the "commemorate mode" title.
  /// DEFAULT: `Commemorating ${owner}`
  commemorateModeTitle?: string;

  /// Customize the "commemorate mode" content on deathday.
  /// DEFAULT: `Today is the death day of the owner. The webpage will commemorate him/her for 24 hours.`
  commemorateModeContentOnDeathday?: string;

  /// Customize the "commemorate mode" content on Qingming festival.
  /// DEFAULT: `Today is Qingming festival. The webpage will commemorate him/her for 24 hours.`
  commemorateModeContentOnQMFestival?: string;

  /// Social accounts the owner used.
  socialAccounts?: any;

  /// The account button group's name generator.
  accountButtonGroupTextGenerator?: (platformname: string) => string;

  /// The account button prefix generator.
  accountButtonPrefixGenerator?: (platformname: string) => React.ReactNode;

  /// Determines if there are line breaks between account buttons. Defaults to false.
  doAccountButtonLineBreak?: boolean;
}

export interface GraveProps {
  config: GraveConfig;
}

function isLeapYear(yearNumber: number): boolean {
  return (((yearNumber % 4)===0) && ((yearNumber % 100)!==0)) || ((yearNumber % 400)===0);
}

export class Grave extends React.Component<GraveProps> {
  private prv_isQingming() {
    const now = new Date();
    if (isLeapYear(now.getFullYear()) || isLeapYear(now.getFullYear() - 1)) {
      return now.getMonth() === 3 && now.getDate() === 4;
    } else {
      return now.getMonth() === 3 && now.getDate() === 5;
    }
  }

  private prv_isCommemorateMode(defaultConfig: GraveConfig) {
    let result = false;
    const now = new Date();
    if (this.props.config.deathCommemorateEnabled ?? defaultConfig.deathCommemorateEnabled) {
      result = (now.getMonth() === this.props.config.deathday.getMonth() && now.getDate() === this.props.config.deathday.getDate());
    }
    if (this.props.config.qingmingModeEnabled ?? defaultConfig.qingmingModeEnabled) {
      result = (result || this.prv_isQingming());
    }
    return result;
  }

  render(): React.ReactNode {
    const defaultConfig: GraveConfig = {
      owner: "undefined",
      birthday: new Date(2008, 2, 1),
      deathday: new Date(0, 0, 0),
      qingmingModeEnabled: false,
      deathCommemorateEnabled: true,
      socialAccounts: {},
      accountButtonGroupTextGenerator: (p) => `View Owner's ${p}`,
      accountButtonPrefixGenerator: (p) => (<><People></People>&nbsp;</>),
    };
    defaultConfig.commemorateModeTitle = `Commemorating ${this.props.config.owner}`;
    defaultConfig.commemorateModeContentOnDeathday = `Today is the death day of the owner. The webpage will commemorate him/her for 24 hours.`;
    defaultConfig.commemorateModeContentOnQMFestival = `Today is Qingming festival. The webpage will commemorate him/her for 24 hours.`;

    let isCommemorateMode = this.prv_isCommemorateMode(defaultConfig);
    let isQingming = this.prv_isQingming();

    // Initialize the social accounts.
    let socialAccounts: React.ReactNode[] = [];
    const accounts = (this.props.config.socialAccounts ?? defaultConfig.socialAccounts);
    for (const i in accounts) {
      const targetURL = accounts[i];
      if (typeof targetURL !== 'string') {
        throw new Error("Should provide a URL String!");
      }
      socialAccounts.push(<Button onClick={(e) => {
        window.location.href = targetURL;
      }}>
        {((this.props.config.accountButtonPrefixGenerator ?? defaultConfig.accountButtonPrefixGenerator)!!)(i)}
        {((this.props.config.accountButtonGroupTextGenerator ?? defaultConfig.accountButtonGroupTextGenerator)!!)(i)}
      </Button>);
      if (this.props.config.doAccountButtonLineBreak ?? false) {
        socialAccounts.push(<br></br>);
      }
    }

    if (!isCommemorateMode) {
      return (<>
        <Card>
          <div style={{
            padding: '30px'
          }}>
            {this.props.config.customHeader}
            <Typography variant="h2" component="div">
              {
                this.props.config.owner
              }
            </Typography>
            <Typography variant="h5" component="div">
              {
                this.props.config.birthday.toDateString()
              }
              &nbsp;~&nbsp;
              {
                this.props.config.deathday.toDateString()
              }
            </Typography>
            <Typography>
              {
                this.props.config.customDescription
              }
            </Typography>
            {socialAccounts}
          </div>
        </Card>
      </>);
    } else {
      document.title = this.props.config.commemorateModeTitle ?? defaultConfig.commemorateModeTitle;
      return (<>
        <Card>
          <div style={{
            padding: '30px'
          }}>
            <Typography variant="h2" component="div">
              {
                this.props.config.owner
              }
            </Typography>
            <Typography variant="h5" component="div">
              {
                this.props.config.birthday.toDateString()
              }
              &nbsp;~&nbsp;
              {
                this.props.config.deathday.toDateString()
              }
            </Typography>
            <Typography variant="h6" component="div">
              {
                isQingming ? (this.props.config.commemorateModeContentOnQMFestival ?? defaultConfig.commemorateModeContentOnQMFestival) : (this.props.config.commemorateModeContentOnDeathday ?? defaultConfig.commemorateModeContentOnDeathday)
              }
            </Typography>
          </div>
        </Card>
      </>);
    }
  }
}
