//
//  SpinnerViewController.h
//  doctorsnapi
//
//  Created by Matt Sencenbaugh on 1/30/12.
//  Copyright (c) 2012 Stanford University. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SpinnerView : UIView {
    IBOutlet UIActivityIndicatorView *spinner;
}

@property(nonatomic,strong)IBOutlet UIActivityIndicatorView *spinner;
@end
